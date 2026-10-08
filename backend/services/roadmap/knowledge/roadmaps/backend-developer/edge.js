/**
 * RIO Backend Developer Roadmap
 *
 * Canonical dependency graph.
 *
 * The node's `prerequisites` field is the source of truth.
 * This file converts those prerequisites into canonical edges.
 *
 * This keeps the roadmap maintainable:
 *
 * prerequisite node
 *        ↓
 * target node
 */

import { createKnowledgeEdge } from "../../factory.js";
import backendDeveloperNodes from "./node.js";

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

const nodeIds = new Set(backendDeveloperNodes.map((node) => node.id));

/* -------------------------------------------------------------------------- */
/* Build prerequisite edges                                                    */
/* -------------------------------------------------------------------------- */

const prerequisiteEdges = backendDeveloperNodes.flatMap((node) => {
  const prerequisites = Array.isArray(node.prerequisites)
    ? node.prerequisites
    : [];

  return prerequisites.map((prerequisiteId) => {
    if (!nodeIds.has(prerequisiteId)) {
      throw new Error(
        `[Backend Roadmap] Invalid prerequisite "${prerequisiteId}" ` +
          `referenced by node "${node.id}".`
      );
    }

    return createKnowledgeEdge({
      source: prerequisiteId,
      target: node.id,
      type: "prerequisite",
      reason: `${prerequisiteId} provides required foundation for ${node.id}.`,
    });
  });
});

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export const backendDeveloperEdges = prerequisiteEdges;

export default backendDeveloperEdges;