import llm from "../config/llm.js";
import interviewPrompt from "../prompts/interview.prompt.js";
import { interviewQuestionSchema } from "../validators/interview.schema.js";

export const interviewAgent = async (data) => {
  try {
    // 1. Build the prompt using the interview configuration
    const prompt = interviewPrompt(data);

    // 2. Ask the LLM to generate the interview question
    const response = await llm.invoke(prompt);

    // 3. Convert the LLM response into a string
    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    // 4. Remove markdown code fences if the LLM adds them
    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 5. Convert JSON string into JavaScript object
    const parsed = JSON.parse(cleaned);

    // 6. Validate the LLM output using Zod
    const validatedQuestion = interviewQuestionSchema.parse(parsed);

    // 7. Return only validated data
    return validatedQuestion;
  } catch (error) {
    console.error("Interview Agent Error:", error);

    throw new Error("Failed to generate interview question.");
  }
};
