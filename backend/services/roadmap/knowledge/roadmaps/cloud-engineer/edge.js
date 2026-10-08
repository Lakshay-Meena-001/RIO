import { createKnowledgeEdge } from "../../factory.js";
import cloudEngineerNodes from "./node.js";

const nodeIds = new Set(cloudEngineerNodes.map((node) => node.id));

const prerequisiteEdges = cloudEngineerNodes.flatMap((node) => {
  const prerequisites = Array.isArray(node.prerequisites)
    ? node.prerequisites
    : [];

  return prerequisites.map((prerequisiteId) => {
    if (!nodeIds.has(prerequisiteId)) {
      throw new Error(
        `[Cloud Roadmap] Invalid prerequisite "${prerequisiteId}" ` +
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

export const cloudEngineerEdges = prerequisiteEdges;

export default cloudEngineerEdges;
