import llm from "../config/llm.js";
import interviewPrompt from "../prompts/interview.prompt.js";
import { interviewQuestionSchema } from "../validators/interview.schema.js";

export const interviewAgent = async (data) => {
  try {
    // 1. Build prompt
    const prompt = interviewPrompt(data);

    // 2. Ask LLM
    const response = await llm.invoke(prompt);

    // 3. Convert response to string
    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    // 4. Remove markdown JSON fences if present
    const cleaned = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // 5. Parse JSON
    const parsed = JSON.parse(cleaned);

    // 6. Validate LLM output
    const validatedQuestion = interviewQuestionSchema.parse(parsed);

    // 7. Return only validated data
    return validatedQuestion;
  } catch (error) {
    console.error("Interview Agent Error:", error);

    const agentError = new Error("Failed to generate interview question.");

    agentError.statusCode = 502;
    agentError.cause = error;

    throw agentError;
  }
};
