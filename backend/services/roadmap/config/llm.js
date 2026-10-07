import "dotenv/config";

/**
 * Roadmap LLM configuration.
 *
 * The rest of the Roadmap Service should never depend directly
 * on a specific LLM provider.
 *
 * Only the adaptation agent talks to this abstraction.
 */

const LLM_CONFIG = {
  provider: process.env.ROADMAP_LLM_PROVIDER || "groq",

  model: process.env.ROADMAP_LLM_MODEL || "openai/gpt-oss-120b",

  temperature: Number(process.env.ROADMAP_LLM_TEMPERATURE ?? 0.2),

  maxTokens: Number(process.env.ROADMAP_LLM_MAX_TOKENS ?? 4000),

  maxRetries: Number(process.env.ROADMAP_LLM_MAX_RETRIES ?? 2),
};

/**
 * Validate required configuration.
 */
function validateLLMConfig() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is required for roadmap AI adaptation");
  }

  if (!LLM_CONFIG.model) {
    throw new Error("ROADMAP_LLM_MODEL is required");
  }

  return true;
}

/**
 * Create the provider client.
 *
 * Provider-specific implementation stays inside this function.
 */
async function createLLMClient() {
  validateLLMConfig();

  if (LLM_CONFIG.provider === "groq") {
    const { default: Groq } = await import("groq-sdk");

    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    return {
      async generate(prompt) {
        let lastError = null;

        for (let attempt = 0; attempt <= LLM_CONFIG.maxRetries; attempt++) {
          try {
            const completion = await client.chat.completions.create({
              model: LLM_CONFIG.model,

              temperature: LLM_CONFIG.temperature,

              max_tokens: LLM_CONFIG.maxTokens,

              messages: [
                {
                  role: "system",
                  content: "You are a strict JSON API. Return only valid JSON.",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
            });

            const content = completion?.choices?.[0]?.message?.content;

            if (!content) {
              throw new Error("LLM returned an empty response");
            }

            return content;
          } catch (error) {
            lastError = error;

            if (attempt === LLM_CONFIG.maxRetries) {
              break;
            }
          }
        }

        throw new Error(
          `Roadmap LLM generation failed: ${
            lastError?.message || "Unknown error"
          }`,
        );
      },
    };
  }

  throw new Error(`Unsupported roadmap LLM provider: ${LLM_CONFIG.provider}`);
}

let llmClientPromise = null;

/**
 * Lazily initialize the LLM client.
 *
 * This is important because the Roadmap Service can still serve
 * standard roadmaps without initializing the LLM provider.
 */
function getLLMClient() {
  if (!llmClientPromise) {
    llmClientPromise = createLLMClient();
  }

  return llmClientPromise;
}

export { LLM_CONFIG, validateLLMConfig, getLLMClient };

export default getLLMClient;
