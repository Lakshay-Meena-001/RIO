import llm from "../config/llm.js";
import summaryPrompt from "../prompts/summary.prompt.js";
import { summarySchema } from "../validators/interview.schema.js";

export const summaryAgent = async (data) => {
  try {
    // 1. Build prompt
    const prompt = summaryPrompt(data);

    // 2. Ask LLM for final report
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
    const validatedSummary =
      summarySchema.parse(parsed);

    // 7. Return only validated data
    return validatedSummary;
  } catch (error) {
    console.error("Summary Agent Error:", error);

    const agentError = new Error(
      "Failed to generate interview summary.",
    );

    agentError.statusCode = 502;
    agentError.cause = error;

    throw agentError;
  }
};