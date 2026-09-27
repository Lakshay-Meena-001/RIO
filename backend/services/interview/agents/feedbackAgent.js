import llm from "../config/llm.js";
import feedbackPrompt from "../prompts/feedback.prompt.js";
import { feedbackSchema } from "../validators/interview.schema.js";

export const feedbackAgent = async (data) => {
  try {
    // 1. Build prompt
    const prompt = feedbackPrompt(data);

    // 2. Ask LLM for evaluation
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
    const validatedFeedback =
      feedbackSchema.parse(parsed);

    // 7. Return only validated data
    return validatedFeedback;
  } catch (error) {
    console.error("Feedback Agent Error:", error);

    const agentError = new Error(
      "Failed to evaluate interview answer.",
    );

    agentError.statusCode = 502;
    agentError.cause = error;

    throw agentError;
  }
};