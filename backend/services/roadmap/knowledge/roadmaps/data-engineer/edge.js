import { createKnowledgeEdge } from "../../factory.js";
import dataEngineerNodes from "./node.js";

const nodeIds = new Set(dataEngineerNodes.map((node) => node.id));

const prerequisiteEdges = dataEngineerNodes.flatMap((node) => {
  const prerequisites = Array.isArray(node.prerequisites)
    ? node.prerequisites
    : [];

  return prerequisites.map((prerequisiteId) => {
    if (!nodeIds.has(prerequisiteId)) {
      throw new Error(
        `[Data Engineer Roadmap] Invalid prerequisite "${prerequisiteId}" ` +
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

export const dataEngineerEdges = prerequisiteEdges;

export default dataEngineerEdges;
