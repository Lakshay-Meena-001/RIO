import "dotenv/config";

// ============================================================
// CONFIG
// ============================================================

const DEFAULT_PROVIDER = "groq";

const DEFAULT_MODEL = "openai/gpt-oss-120b";

const DEFAULT_TEMPERATURE = 0.2;

const DEFAULT_MAX_TOKENS = 4000;

const DEFAULT_MAX_RETRIES = 2;

const DEFAULT_TIMEOUT_MS = 30000;

// ============================================================
// ENVIRONMENT
// ============================================================

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

// ============================================================
// VALIDATION
// ============================================================

function validateConfig() {
  if (provider !== "groq") {
    throw new Error(`Unsupported roadmap LLM provider: ${provider}`);
  }

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is required for adaptive roadmap generation");
  }

  if (!Number.isFinite(temperature) || temperature < 0 || temperature > 2) {
    throw new Error("ROADMAP_LLM_TEMPERATURE must be between 0 and 2");
  }

  if (!Number.isInteger(maxTokens) || maxTokens <= 0) {
    throw new Error("ROADMAP_LLM_MAX_TOKENS must be a positive integer");
  }

  if (!Number.isInteger(maxRetries) || maxRetries < 0) {
    throw new Error("ROADMAP_LLM_MAX_RETRIES must be a non-negative integer");
  }

  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("ROADMAP_LLM_TIMEOUT_MS must be a positive integer");
  }
}

// ============================================================
// LAZY CLIENT
// ============================================================

let llmClientPromise = null;

/**
 * We intentionally lazy-load Groq.
 *
 * Why?
 *
 * Standard roadmap generation never needs the LLM.
 *
 * Therefore:
 *
 * Server starts
 *     ↓
 * standard requests
 *     ↓
 * no Groq SDK initialization required
 *
 * Only when resume/custom adaptation happens:
 *
 *     ↓
 * initialize Groq
 */
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

    temperature,

    maxTokens,

    maxRetries,

    // ========================================================
    // GENERATE
    // ========================================================

    async generate(prompt) {
      if (typeof prompt !== "string" || !prompt.trim()) {
        throw new Error("LLM prompt must be a non-empty string");
      }

      let lastError = null;

      for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        try {
          const response = await client.chat.completions.create({
            model,

            temperature,

            max_tokens: maxTokens,

            messages: [
              {
                role: "user",

                content: prompt,
              },
            ],
          });

          const content = response?.choices?.[0]?.message?.content;

          if (typeof content !== "string" || !content.trim()) {
            throw new Error("LLM returned an empty response");
          }

          return content;
        } catch (error) {
          lastError = error;

          /**
           * Retry only when another attempt
           * is actually available.
           */
          if (attempt < maxRetries) {
            continue;
          }
        }
      }

      throw new Error(
        `Roadmap LLM generation failed: ${
          lastError?.message || "Unknown LLM error"
        }`,
      );
    },
  };
}

// ============================================================
// PUBLIC GETTER
// ============================================================

async function getLLMClient() {
  if (!llmClientPromise) {
    llmClientPromise = createLLMClient();
  }

  return llmClientPromise;
}

// ============================================================
// PUBLIC CONFIG
// ============================================================

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

// ============================================================
// EXPORTS
// ============================================================

export { getLLMClient, getLLMConfig };

export default getLLMClient;
