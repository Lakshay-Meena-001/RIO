import Roadmap from "../models/roadmap.model.js";

import {
  ROADMAP_NODE_STATUSES,
  ROADMAP_STATUSES,
} from "../constants/roadmap.constants.js";

import { loadRoadmap, loadRoadmapNode } from "../knowledge/loader.js";

// ============================================================
// PROGRESS SERVICE
// ============================================================

class ProgressService {
  // ==========================================================
  // IMPORTANCE → PRIORITY
  // ==========================================================

  /**
   * Knowledge importance and user-facing focus priority
   * are different concepts.
   *
   * Knowledge:
   *   core
   *   important
   *   optional
   *   advanced
   *
   * Focus:
   *   low
   *   medium
   *   high
   */
  mapImportanceToPriority(importance) {
    switch (importance) {
      case "core":
        return "high";

      case "important":
        return "high";

      case "advanced":
        return "medium";

      case "optional":
        return "low";

      default:
        return "medium";
    }
  }

  // ==========================================================
  // CALCULATE PROGRESS
  // ==========================================================

  /**
   * Calculate aggregate progress from actual node states.
   *
   * completed + skipped = progressed
   *
   * learning is NOT counted as completed.
   */
  calculateProgress(nodes = []) {
    const total = nodes.length;

    const completed = nodes.filter(
      (node) => node.status === ROADMAP_NODE_STATUSES.COMPLETED,
    ).length;

    const learning = nodes.filter(
      (node) => node.status === ROADMAP_NODE_STATUSES.LEARNING,
    ).length;

    const skipped = nodes.filter(
      (node) => node.status === ROADMAP_NODE_STATUSES.SKIPPED,
    ).length;

    const remaining = total - completed - skipped;

    const percentage =
      total === 0 ? 0 : Math.round(((completed + skipped) / total) * 100);

    return {
      percentage,
      total,
      completed,
      learning,
      skipped,
      remaining,
    };
  }

  // ==========================================================
  // CURRENT FOCUS
  // ==========================================================

  /**
   * Determine the user's next move.
   *
   * Priority:
   *
   * 1. Currently learning node
   * 2. First not-started node
   * 3. null when everything is completed/skipped
   */
  getCurrentFocus(nodes = [], roadmapTemplate) {
    const learningNode = nodes.find(
      (node) => node.status === ROADMAP_NODE_STATUSES.LEARNING,
    );

    if (learningNode) {
      return this.buildFocus(learningNode, roadmapTemplate);
    }

    const nextNode = nodes.find(
      (node) => node.status === ROADMAP_NODE_STATUSES.NOT_STARTED,
    );

    if (nextNode) {
      return this.buildFocus(nextNode, roadmapTemplate);
    }

    return null;
  }

  // ==========================================================
  // BUILD CURRENT FOCUS
  // ==========================================================

  /**
   * Convert a roadmap node into the
   * "Your Next Move" object.
   */
  buildFocus(roadmapNode, roadmapTemplate) {
    const knowledgeNode = loadRoadmapNode(
      roadmapTemplate.id,
      roadmapNode.nodeId,
    );

    if (!knowledgeNode) {
      return null;
    }

    return {
      nodeId: roadmapNode.nodeId,

      reason:
        knowledgeNode.whyItMatters ||
        knowledgeNode.description ||
        "This is the next recommended step in your roadmap.",

      priority: this.mapImportanceToPriority(knowledgeNode.importance),
    };
  }

  // ==========================================================
  // ROADMAP LOOKUP
  // ==========================================================

  /**
   * Fetch a roadmap owned by the current user.
   *
   * Never allow one user to modify another user's roadmap.
   */
  async getOwnedRoadmap(userId, roadmapId) {
    if (!userId) {
      throw new Error("userId is required");
    }

    if (!roadmapId) {
      throw new Error("roadmapId is required");
    }

    const roadmap = await Roadmap.findOne({
      _id: roadmapId,
      userId,
    });

    if (!roadmap) {
      const error = new Error("Roadmap not found");

      error.statusCode = 404;

      throw error;
    }

    return roadmap;
  }

  // ==========================================================
  // RECALCULATE
  // ==========================================================

  /**
   * Recalculate progress and current focus
   * after a node changes.
   */
  async recalculate(userId, roadmapId) {
    const roadmap = await this.getOwnedRoadmap(userId, roadmapId);

    const roadmapTemplate = loadRoadmap(roadmap.templateId);

    const progress = this.calculateProgress(roadmap.nodes);

    const currentFocus = this.getCurrentFocus(roadmap.nodes, roadmapTemplate);

    roadmap.progress = progress;

    roadmap.currentFocus = currentFocus;

    /**
     * No remaining work means roadmap is complete.
     */
    if (progress.total > 0 && progress.remaining === 0) {
      roadmap.status = ROADMAP_STATUSES.COMPLETED;
    } else {
      /**
       * If user previously completed the roadmap
       * but resets/skips something, reopen it.
       */
      if (roadmap.status === ROADMAP_STATUSES.COMPLETED) {
        roadmap.status = ROADMAP_STATUSES.ACTIVE;
      }
    }

    await roadmap.save();

    return roadmap;
  }

  // ==========================================================
  // UPDATE NODE STATUS
  // ==========================================================

  async updateNodeStatus(userId, roadmapId, nodeId, status) {
    const roadmap = await this.getOwnedRoadmap(userId, roadmapId);

    const validStatuses = Object.values(ROADMAP_NODE_STATUSES);

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid roadmap node status: ${status}`);
    }

    const roadmapNode = roadmap.nodes.find((node) => node.nodeId === nodeId);

    if (!roadmapNode) {
      const error = new Error(`Node not found in roadmap: ${nodeId}`);

      error.statusCode = 404;

      throw error;
    }

    const now = new Date();

    roadmapNode.status = status;

    roadmapNode.updatedAt = now;

    // --------------------------------------------------------
    // LEARNING
    // --------------------------------------------------------

    if (status === ROADMAP_NODE_STATUSES.LEARNING) {
      /**
       * Don't overwrite the original start time
       * if the user returns to a learning node.
       */
      if (!roadmapNode.startedAt) {
        roadmapNode.startedAt = now;
      }

      roadmapNode.completedAt = null;

      roadmapNode.skippedReason = null;
    }

    // --------------------------------------------------------
    // COMPLETED
    // --------------------------------------------------------

    if (status === ROADMAP_NODE_STATUSES.COMPLETED) {
      /**
       * A node cannot be completed without
       * having effectively started.
       */
      if (!roadmapNode.startedAt) {
        roadmapNode.startedAt = now;
      }

      roadmapNode.completedAt = now;

      roadmapNode.skippedReason = null;
    }

    // --------------------------------------------------------
    // SKIPPED
    // --------------------------------------------------------

    if (status === ROADMAP_NODE_STATUSES.SKIPPED) {
      roadmapNode.completedAt = null;
    }

    // --------------------------------------------------------
    // NOT STARTED
    // --------------------------------------------------------

    if (status === ROADMAP_NODE_STATUSES.NOT_STARTED) {
      roadmapNode.completedAt = null;

      roadmapNode.skippedReason = null;
    }

    await roadmap.save();

    return this.recalculate(userId, roadmapId);
  }

  // ==========================================================
  // COMPLETE NODE
  // ==========================================================

  async completeNode(userId, roadmapId, nodeId) {
    return this.updateNodeStatus(
      userId,
      roadmapId,
      nodeId,
      ROADMAP_NODE_STATUSES.COMPLETED,
    );
  }

  // ==========================================================
  // START NODE
  // ==========================================================

  async startNode(userId, roadmapId, nodeId) {
    return this.updateNodeStatus(
      userId,
      roadmapId,
      nodeId,
      ROADMAP_NODE_STATUSES.LEARNING,
    );
  }

  // ==========================================================
  // RESET NODE
  // ==========================================================

  async resetNode(userId, roadmapId, nodeId) {
    return this.updateNodeStatus(
      userId,
      roadmapId,
      nodeId,
      ROADMAP_NODE_STATUSES.NOT_STARTED,
    );
  }

  // ==========================================================
  // SKIP NODE
  // ==========================================================

  async skipNode(userId, roadmapId, nodeId, reason = null) {
    const roadmap = await this.getOwnedRoadmap(userId, roadmapId);

    const roadmapNode = roadmap.nodes.find((node) => node.nodeId === nodeId);

    if (!roadmapNode) {
      const error = new Error(`Node not found in roadmap: ${nodeId}`);

      error.statusCode = 404;

      throw error;
    }

    roadmapNode.status = ROADMAP_NODE_STATUSES.SKIPPED;

    roadmapNode.skippedReason =
      typeof reason === "string" ? reason.trim() || null : null;

    roadmapNode.completedAt = null;

    roadmapNode.updatedAt = new Date();

    await roadmap.save();

    return this.recalculate(userId, roadmapId);
  }

  // ==========================================================
  // GET PROGRESS
  // ==========================================================

  /**
   * Return calculated progress without
   * modifying the database.
   */
  async getProgress(userId, roadmapId) {
    const roadmap = await this.getOwnedRoadmap(userId, roadmapId);

    const roadmapTemplate = loadRoadmap(roadmap.templateId);

    return {
      roadmapId: roadmap._id,

      progress: this.calculateProgress(roadmap.nodes),

      currentFocus: this.getCurrentFocus(roadmap.nodes, roadmapTemplate),

      status: roadmap.status,
    };
  }
}

// ============================================================
// EXPORT
// ============================================================

const progressService = new ProgressService();

export default progressService;
