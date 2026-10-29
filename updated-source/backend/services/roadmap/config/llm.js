import "dotenv/config";

const DEFAULT_PROVIDER = "groq";
const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_MAX_TOKENS = 12000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_TIMEOUT_MS = 90000;

const provider = (process.env.ROADMAP_LLM_PROVIDER || DEFAULT_PROVIDER)
  .trim()
  .toLowerCase();

const model = (
  process.env.ROADMAP_LLM_MODEL ||
  (provider === "gemini" ? "gemini-2.5-flash" : "openai/gpt-oss-120b")
).trim();

const temperature = Number(
  process.env.ROADMAP_LLM_TEMPERATURE ?? DEFAULT_TEMPERATURE,
);

const maxTokens = Number(
  process.env.ROADMAP_LLM_MAX_TOKENS ?? DEFAULT_MAX_TOKENS,
);

const maxRetries = Number(
  process.env.ROADMAP_LLM_MAX_RETRIES ?? DEFAULT_MAX_RETRIES,
);

const timeoutMs = Number(
  process.env.ROADMAP_LLM_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS,
);

function getRetryDelayMs(error, attempt) {
  const message = String(error?.message || "");
  const match = message.match(/try again in\s+([\d.]+)s/i);

  if (error?.status === 429 && match) {
    return Math.ceil(Number(match[1]) * 1000) + 500;
  }

  const retryAfter =
    error?.headers?.["retry-after"] ?? error?.headers?.get?.("retry-after");

  if (error?.status === 429 && retryAfter != null) {
    const seconds = Number(retryAfter);

    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.ceil(seconds * 1000) + 500;
    }
  }

  return Math.min(1000 * 2 ** attempt, 30000);
}

function validateConfig() {
  if (!["groq", "gemini"].includes(provider)) {
    throw new Error(`Unsupported roadmap LLM provider: ${provider}`);
  }

  if (provider === "groq" && !process.env.GROQ_API_KEY?.trim()) {
    throw new Error("GROQ_API_KEY is required for the Groq provider.");
  }

  if (provider === "gemini" && !process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("GEMINI_API_KEY is required for the Gemini provider.");
  }

  if (!model) {
    throw new Error("ROADMAP_LLM_MODEL cannot be empty.");
  }

  if (!Number.isFinite(temperature) || temperature < 0 || temperature > 2) {
    throw new Error("ROADMAP_LLM_TEMPERATURE must be between 0 and 2.");
  }

  if (!Number.isInteger(maxTokens) || maxTokens <= 0) {
    throw new Error("ROADMAP_LLM_MAX_TOKENS must be a positive integer.");
  }

  if (!Number.isInteger(maxRetries) || maxRetries < 0) {
    throw new Error("ROADMAP_LLM_MAX_RETRIES must be non-negative.");
  }

  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("ROADMAP_LLM_TIMEOUT_MS must be positive.");
  }
}

function createHttpError(message, status, headers) {
  const error = new Error(message);
  error.status = status;
  error.headers = headers;
  return error;
}

async function generateWithGemini(
  prompt,
  options,
  requestMaxTokens,
  requestTemperature,
) {
  const apiKey = process.env.GEMINI_API_KEY.trim();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const body = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: requestTemperature,
        maxOutputTokens: requestMaxTokens,
      },
    };

    if (options.systemPrompt) {
      body.systemInstruction = {
        parts: [{ text: options.systemPrompt }],
      };
    }

    if (options.responseFormat === "json_object") {
      body.generationConfig.responseMimeType = "application/json";
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        result?.error?.message ||
        `Gemini API request failed with status ${response.status}.`;

      throw createHttpError(message, response.status, response.headers);
    }

    const candidate = result?.candidates?.[0];
    const content = candidate?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!content) {
      throw new Error(
        `Gemini returned no text. Finish reason: ${candidate?.finishReason || "unknown"}`,
      );
    }

    if (candidate?.finishReason === "MAX_TOKENS") {
      const error = new Error(
        "Gemini output reached its token limit; output may be incomplete.",
      );
      error.code = "LLM_OUTPUT_TRUNCATED";
      throw error;
    }

    return content;
  } finally {
    clearTimeout(timeout);
  }
}

let clientPromise;

async function createLLMClient() {
  validateConfig();

  let groqClient;

  if (provider === "groq") {
    const { default: Groq } = await import("groq-sdk");

    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
      timeout: timeoutMs,
      maxRetries: 0,
    });
  }

  return {
    provider,
    model,

    async generate(prompt, options = {}) {
      if (typeof prompt !== "string" || !prompt.trim()) {
        throw new Error("LLM prompt must be a non-empty string.");
      }

      const requestMaxTokens = options.maxTokens ?? maxTokens;
      const requestTemperature = options.temperature ?? temperature;

      if (!Number.isInteger(requestMaxTokens) || requestMaxTokens <= 0) {
        throw new Error("Request maxTokens must be a positive integer.");
      }

      let lastError;

      for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        try {
          let content;

          if (provider === "gemini") {
            content = await generateWithGemini(
              prompt,
              options,
              requestMaxTokens,
              requestTemperature,
            );
          } else {
            const messages = options.systemPrompt
              ? [
                  { role: "system", content: options.systemPrompt },
                  { role: "user", content: prompt },
                ]
              : [{ role: "user", content: prompt }];

            const request = {
              model,
              temperature: requestTemperature,
              max_completion_tokens: requestMaxTokens,
              messages,
            };

            if (options.responseFormat === "json_object") {
              request.response_format = { type: "json_object" };
            }

            const response = await groqClient.chat.completions.create(request);
            const choice = response?.choices?.[0];
            content = choice?.message?.content;

            if (choice?.finish_reason === "length") {
              const error = new Error(
                "Groq output reached its token limit; output may be incomplete.",
              );
              error.code = "LLM_OUTPUT_TRUNCATED";
              throw error;
            }
          }

          if (typeof content !== "string" || !content.trim()) {
            throw new Error("LLM returned an empty response.");
          }

          return content.trim();
        } catch (error) {
          lastError = error;

          console.error("[Roadmap LLM] Request failed:", {
            provider,
            model,
            message: error?.message,
            status: error?.status,
            code: error?.code,
          });

          const status = error?.status;
          const retryable =
            status === 429 ||
            (Number.isFinite(status) && status >= 500) ||
            error?.code === "ETIMEDOUT" ||
            error?.code === "ECONNRESET" ||
            error?.name === "AbortError";

          if (!retryable || attempt === maxRetries) {
            break;
          }

          const delayMs = getRetryDelayMs(error, attempt);

          console.warn(
            `[Roadmap LLM] Retrying after ${Math.ceil(delayMs / 1000)}s ` +
              `(attempt ${attempt + 1}/${maxRetries}).`,
          );

          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }

      const wrappedError = new Error(
        `Roadmap LLM request failed using ${provider}.`,
      );

      wrappedError.code = lastError?.code || "ROADMAP_LLM_FAILED";
      wrappedError.cause = lastError;

      throw wrappedError;
    },
  };
}

async function getLLMClient() {
  if (!clientPromise) {
    clientPromise = createLLMClient().catch((error) => {
      clientPromise = undefined;
      throw error;
    });
  }

  return clientPromise;
}

function getLLMConfig() {
  return {
    provider,
    model,
    temperature,
    maxTokens,
    maxRetries,
    timeoutMs,
  };
}

export { getLLMClient, getLLMConfig };
export default getLLMClient;
