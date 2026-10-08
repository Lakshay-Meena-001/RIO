import { createKnowledgeEdge } from "../../factory.js";
import systemDesignSoftwareArchitectureNodes from "./node.js";

const nodeIds = new Set(
  systemDesignSoftwareArchitectureNodes.map((node) => node.id),
);

const prerequisiteEdges = systemDesignSoftwareArchitectureNodes.flatMap(
  (node) => {
    const prerequisites = Array.isArray(node.prerequisites)
      ? node.prerequisites
      : [];

    return prerequisites.map((prerequisiteId) => {
      if (!nodeIds.has(prerequisiteId)) {
        throw new Error(
          `[System Design Roadmap] Invalid prerequisite "${prerequisiteId}" ` +
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
  },
);

export const systemDesignSoftwareArchitectureEdges = prerequisiteEdges;

export default systemDesignSoftwareArchitectureEdges;
