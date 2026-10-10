import "dotenv/config";

const DEFAULT_PROVIDER = "groq";
const DEFAULT_MODEL = "openai/gpt-oss-120b";
const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_MAX_TOKENS = 12000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_TIMEOUT_MS = 90000;

const provider = (process.env.ROADMAP_LLM_PROVIDER || DEFAULT_PROVIDER)
  .trim()
  .toLowerCase();

const model = (process.env.ROADMAP_LLM_MODEL || DEFAULT_MODEL).trim();

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

function validateConfig() {
  if (provider !== "groq") {
    throw new Error(`Unsupported roadmap LLM provider: ${provider}`);
  }

  if (!process.env.GROQ_API_KEY?.trim()) {
    throw new Error("GROQ_API_KEY is required.");
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

let clientPromise;

async function createLLMClient() {
  validateConfig();

  const { default: Groq } = await import("groq-sdk");

  const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    timeout: timeoutMs,
    maxRetries: 0,
  });

  return {
    provider,
    model,

    async generate(prompt, options = {}) {
      if (typeof prompt !== "string" || !prompt.trim()) {
        throw new Error("LLM prompt must be a non-empty string.");
      }

      const requestMaxTokens = options.maxTokens ?? maxTokens;
      const requestTemperature = options.temperature ?? temperature;
      const responseFormat = options.responseFormat;

      if (!Number.isInteger(requestMaxTokens) || requestMaxTokens <= 0) {
        throw new Error("Request maxTokens must be a positive integer.");
      }

      const messages = options.systemPrompt
        ? [
            { role: "system", content: options.systemPrompt },
            { role: "user", content: prompt },
          ]
        : [{ role: "user", content: prompt }];

      let lastError;

      for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        try {
          const request = {
            model,
            temperature: requestTemperature,
            max_completion_tokens: requestMaxTokens,
            messages,
          };

          if (responseFormat === "json_object") {
            request.response_format = { type: "json_object" };
          }

          const response = await client.chat.completions.create(request);
          const choice = response?.choices?.[0];
          const content = choice?.message?.content;

          if (typeof content !== "string" || !content.trim()) {
            throw new Error("LLM returned an empty response.");
          }

          if (choice.finish_reason === "length") {
            const error = new Error(
              "LLM output reached its token limit; increase the request budget or reduce the phase scope.",
            );
            error.code = "LLM_OUTPUT_TRUNCATED";
            throw error;
          }

          return content.trim();
        } catch (error) {
          lastError = error;

          const status = error?.status;
          const retryable =
            status === 429 ||
            status >= 500 ||
            error?.code === "ETIMEDOUT" ||
            error?.code === "ECONNRESET";

          if (!retryable || attempt === maxRetries) {
            break;
          }

          const delayMs = Math.min(1000 * 2 ** attempt, 4000);

          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }

      const wrappedError = new Error("Roadmap LLM request failed.");

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
