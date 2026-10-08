import { createKnowledgeEdge } from "../../factory.js";
import devopsPlatformEngineerNodes from "./node.js";

const nodeIds = new Set(devopsPlatformEngineerNodes.map((node) => node.id));

const prerequisiteEdges = devopsPlatformEngineerNodes.flatMap((node) => {
  const prerequisites = Array.isArray(node.prerequisites)
    ? node.prerequisites
    : [];

  return prerequisites.map((prerequisiteId) => {
    if (!nodeIds.has(prerequisiteId)) {
      throw new Error(
        `[DevOps Roadmap] Invalid prerequisite "${prerequisiteId}" ` +
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

export const devopsPlatformEngineerEdges = prerequisiteEdges;

export default devopsPlatformEngineerEdges;
