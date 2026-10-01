import llm from "../config/llm.js";
import interviewPrompt from "../prompts/interview.prompt.js";
import { interviewQuestionsSchema } from "../validators/interview.schema.js";

export const interviewAgent = async (data) => {
  try {
    const prompt = interviewPrompt(data);

    const response = await llm.invoke(prompt);

    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    const cleaned = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    const validatedQuestions = interviewQuestionsSchema.parse(parsed);

    return validatedQuestions;
  } catch (error) {
    console.error("Interview Agent Error:", error);

    const agentError = new Error(
      "Failed to generate interview questions."
    );

    agentError.statusCode = 502;
    agentError.cause = error;

    throw agentError;
  }
};