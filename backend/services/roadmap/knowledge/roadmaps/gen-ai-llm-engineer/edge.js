import { createKnowledgeEdge } from "../../factory.js";
import genAiLlmEngineerNodes from "./node.js";

const nodeIds = new Set(genAiLlmEngineerNodes.map((node) => node.id));

const prerequisiteEdges = genAiLlmEngineerNodes.flatMap((node) => {
  const prerequisites = Array.isArray(node.prerequisites)
    ? node.prerequisites
    : [];

  return prerequisites.map((prerequisiteId) => {
    if (!nodeIds.has(prerequisiteId)) {
      throw new Error(
        `[GenAI/LLM Roadmap] Invalid prerequisite "${prerequisiteId}" ` +
          `referenced by node "${node.id}".`,
      );
    }

    return createKnowledgeEdge({
      source: prerequisiteId,
      target: node.id,
      type: "prerequisite",
      reason:
        `${prerequisiteId} provides required foundation for ` + `${node.id}.`,
    });
  });
});

export const genAiLlmEngineerEdges = prerequisiteEdges;

export default genAiLlmEngineerEdges;
