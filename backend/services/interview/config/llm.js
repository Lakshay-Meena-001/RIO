import { ChatGroq } from "@langchain/groq";

const model = "openai/gpt-oss-120b";
const temperature = 0.2;
const maxRetries = 2;

export const createQuestionGenerationLlm = (questionCount = 10) => {
  const count =
    Number.isInteger(questionCount) && questionCount > 0 ? questionCount : 10;

  return new ChatGroq({
    model,
    temperature,
    maxTokens: Math.min(18000, Math.max(6000, count * 360)),
    maxRetries,
  });
};

export const evaluationLlm = new ChatGroq({
  model,
  temperature,
  maxTokens: 2500,
  maxRetries,
});

export const summaryLlm = new ChatGroq({
  model,
  temperature,
  maxTokens: 1200,
  maxRetries,
});
