import llm from "../config/llm.js";
import roadmapPrompt from "../prompts/roadmap.prompt.js";
import { roadmapSchema } from "../validators/roadmap.validator.js";

const buildPrompt = ({ role, targetPackage, resume }) => {
  return roadmapPrompt
    .replace("{role}", role)
    .replace("{targetPackage}", targetPackage)
    .replace("{resume}", resume || "No resume provided.");
};

const extractText = (response) => {
  if (typeof response?.content === "string") {
    return response.content;
  }

  if (Array.isArray(response?.content)) {
    return response.content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return item?.text || "";
      })
      .join("");
  }

  return "";
};

const cleanJsonText = (text) => {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
};

export const generateRoadmap = async ({
  role,
  targetPackage,
  resume = null,
}) => {
  const prompt = buildPrompt({
    role,
    targetPackage,
    resume,
  });

  let response;

  try {
    response = await llm.invoke(prompt);
  } catch (error) {
    console.error("Roadmap LLM generation failed:", {
      message: error.message,
    });

    throw new Error("Unable to generate roadmap.");
  }

  const rawText = extractText(response);

  if (!rawText) {
    throw new Error("Roadmap model returned an empty response.");
  }

  let parsedRoadmap;

  try {
    parsedRoadmap = JSON.parse(cleanJsonText(rawText));
  } catch (error) {
    console.error("Roadmap JSON parsing failed:", {
      message: error.message,
    });

    throw new Error("Roadmap model returned invalid JSON.");
  }

  const validationResult = roadmapSchema.safeParse(parsedRoadmap);

  if (!validationResult.success) {
    console.error("Roadmap schema validation failed:", {
      issues: validationResult.error.issues,
    });

    throw new Error("Roadmap model returned invalid roadmap data.");
  }

  return validationResult.data;
};
