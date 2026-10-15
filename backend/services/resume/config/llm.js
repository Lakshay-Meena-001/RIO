import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_MAX_TOKENS = 8000;
const DEFAULT_MAX_RETRIES = 2;

const provider = (process.env.RESUME_LLM_PROVIDER || "gemini")
  .trim()
  .toLowerCase();

const model = (
  process.env.RESUME_LLM_MODEL ||
  (provider === "gemini" ? "gemini-2.5-flash" : "openai/gpt-oss-120b")
).trim();

const temperature = Number(
  process.env.RESUME_LLM_TEMPERATURE ?? DEFAULT_TEMPERATURE,
);

const maxTokens = Number(
  process.env.RESUME_LLM_MAX_TOKENS ?? DEFAULT_MAX_TOKENS,
);

const maxRetries = Number(
  process.env.RESUME_LLM_MAX_RETRIES ?? DEFAULT_MAX_RETRIES,
);

function validateConfig() {
  if (!["gemini", "groq"].includes(provider)) {
    throw new Error(
      `Unsupported Resume LLM provider: ${provider}. Use "gemini" or "groq".`,
    );
  }

  if (provider === "gemini" && !process.env.GEMINI_API_KEY?.trim()) {
    throw new Error("GEMINI_API_KEY is required for the Gemini provider.");
  }

  if (provider === "groq" && !process.env.GROQ_API_KEY?.trim()) {
    throw new Error("GROQ_API_KEY is required for the Groq provider.");
  }

  if (!model) {
    throw new Error("RESUME_LLM_MODEL cannot be empty.");
  }

  if (!Number.isFinite(temperature) || temperature < 0 || temperature > 2) {
    throw new Error("RESUME_LLM_TEMPERATURE must be between 0 and 2.");
  }

  if (!Number.isInteger(maxTokens) || maxTokens <= 0) {
    throw new Error("RESUME_LLM_MAX_TOKENS must be a positive integer.");
  }

  if (!Number.isInteger(maxRetries) || maxRetries < 0) {
    throw new Error("RESUME_LLM_MAX_RETRIES must be a non-negative integer.");
  }
}

function createLLM() {
  validateConfig();

  const commonConfig = {
    model,
    temperature,
    maxRetries,
  };

  if (provider === "gemini") {
    return new ChatGoogleGenerativeAI({
      ...commonConfig,
      apiKey: process.env.GEMINI_API_KEY,
      maxOutputTokens: maxTokens,
    });
  }

  return new ChatGroq({
    ...commonConfig,
    apiKey: process.env.GROQ_API_KEY,
    maxTokens,
  });
}

const llm = createLLM();

export const getLLMConfig = () => ({
  provider,
  model,
  temperature,
  maxTokens,
  maxRetries,
});

export default llm;
