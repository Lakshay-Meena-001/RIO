import { createKnowledgeEdge } from "../../factory.js";
import fullStackDeveloperNodes from "./node.js";

const nodeIds = new Set(fullStackDeveloperNodes.map((node) => node.id));

const prerequisiteEdges = fullStackDeveloperNodes.flatMap((node) => {
  const prerequisites = Array.isArray(node.prerequisites)
    ? node.prerequisites
    : [];

  return prerequisites.map((prerequisiteId) => {
    if (!nodeIds.has(prerequisiteId)) {
      throw new Error(
        `[Full Stack Roadmap] Invalid prerequisite "${prerequisiteId}" ` +
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

export const fullStackDeveloperEdges = prerequisiteEdges;

export default fullStackDeveloperEdges;
