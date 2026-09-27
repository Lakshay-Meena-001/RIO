import llm from "../config/llm.js";
import summaryPrompt from "../prompts/summary.prompt.js";
import { summarySchema } from "../validators/interview.schema.js";

export const summaryAgent = async (data) => {
  try {
    // 1. Final summary prompt prepare karo
    const prompt = summaryPrompt(data);

    // 2. LLM se final interview report generate karwao
    const response = await llm.invoke(prompt);

    // 3. LLM response ko string mein convert karo
    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    // 4. Markdown JSON code block remove karo
    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 5. JSON string -> JavaScript object
    const parsed = JSON.parse(cleaned);

    // 6. Zod se final report validate karo
    const validatedSummary = summarySchema.parse(parsed);

    // 7. Validated report return karo
    return validatedSummary;
  } catch (error) {
    console.error("Summary Agent Error:", error);

    throw new Error("Failed to generate interview summary.");
  }
};