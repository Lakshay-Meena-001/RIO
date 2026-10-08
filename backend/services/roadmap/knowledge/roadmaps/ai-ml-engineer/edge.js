import { createKnowledgeEdge } from "../../factory.js";
import aiMlEngineerNodes from "./node.js";

const nodeIds = new Set(aiMlEngineerNodes.map((node) => node.id));

const prerequisiteEdges = aiMlEngineerNodes.flatMap((node) => {
  const prerequisites = Array.isArray(node.prerequisites)
    ? node.prerequisites
    : [];

  return prerequisites.map((prerequisiteId) => {
    if (!nodeIds.has(prerequisiteId)) {
      throw new Error(
        `[AI/ML Roadmap] Invalid prerequisite "${prerequisiteId}" ` +
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

export const aiMlEngineerEdges = prerequisiteEdges;

export default aiMlEngineerEdges;
