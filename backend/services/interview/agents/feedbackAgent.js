import llm from "../config/llm.js";
import feedbackPrompt from "../prompts/feedback.prompt.js";
import { feedbackSchema } from "../validators/interview.schema.js";

export const feedbackAgent = async (data) => {
  try {
    // 1. Prompt prepare karo
    const prompt = feedbackPrompt(data);

    // 2. LLM se evaluation lo
    const response = await llm.invoke(prompt);

    // 3. LLM response ko string mein convert karo
    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    // 4. Agar LLM markdown code block mein JSON de
    //    to usko remove karo
    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 5. JSON string -> JavaScript object
    const parsed = JSON.parse(cleaned);

    // 6. Zod se validate karo
    const validatedFeedback = feedbackSchema.parse(parsed);

    // 7. Validated result return karo
    return validatedFeedback;
  } catch (error) {
    console.error("Feedback Agent Error:", error);

    throw new Error("Failed to evaluate interview answer.");
  }
};