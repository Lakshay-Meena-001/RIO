import { createKnowledgeEdge } from "../../factory.js";
import cybersecuritySecurityEngineerNodes from "./node.js";

const nodeIds = new Set(
  cybersecuritySecurityEngineerNodes.map((node) => node.id),
);

const prerequisiteEdges = cybersecuritySecurityEngineerNodes.flatMap((node) => {
  const prerequisites = Array.isArray(node.prerequisites)
    ? node.prerequisites
    : [];

  return prerequisites.map((prerequisiteId) => {
    if (!nodeIds.has(prerequisiteId)) {
      throw new Error(
        `[Cybersecurity Roadmap] Invalid prerequisite "${prerequisiteId}" ` +
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

export const cybersecuritySecurityEngineerEdges = prerequisiteEdges;

export default cybersecuritySecurityEngineerEdges;
