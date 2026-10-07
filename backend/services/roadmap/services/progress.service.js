import Roadmap from "../models/roadmap.model.js";
import { ROADMAP_NODE_STATUSES } from "../constants/roadmap.constants.js";
import { loadRoadmap, loadRoadmapNode } from "../knowledge/loader.js";

class ProgressService {
  /**
   * Calculate progress summary from roadmap nodes.
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

  /**
   * Find the first node that still needs attention.
   *
   * Priority:
   * 1. Currently learning
   * 2. First not-started node
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

  /**
   * Build the "Your Next Move" object.
   */
  buildFocus(roadmapNode, roadmapTemplate) {
    const knowledgeNode = loadRoadmapNode(roadmapTemplate, roadmapNode.nodeId);

    return {
      nodeId: roadmapNode.nodeId,

      reason:
        knowledgeNode.whyItMatters ||
        knowledgeNode.description ||
        "This is the next recommended step in your roadmap.",

      priority: knowledgeNode.importance || "important",
    };
  }

  /**
   * Recalculate and persist roadmap progress.
   */
  async recalculate(userId, roadmapId) {
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
      return null;
    }

    const roadmapTemplate = loadRoadmap(roadmap.templateId);

    const progress = this.calculateProgress(roadmap.nodes);

    const currentFocus = this.getCurrentFocus(roadmap.nodes, roadmapTemplate);

    roadmap.progress = progress;
    roadmap.currentFocus = currentFocus;

    // If every node is completed/skipped,
    // the roadmap itself is considered completed.
    if (progress.total > 0 && progress.remaining === 0) {
      roadmap.status = "completed";
    }

    await roadmap.save();

    return roadmap;
  }

  /**
   * Update one node's progress state.
   */
  async updateNodeStatus(userId, roadmapId, nodeId, status) {
    if (!userId) {
      throw new Error("userId is required");
    }

    if (!roadmapId) {
      throw new Error("roadmapId is required");
    }

    if (!nodeId) {
      throw new Error("nodeId is required");
    }

    const validStatuses = Object.values(ROADMAP_NODE_STATUSES);

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid roadmap node status: ${status}`);
    }

    const roadmap = await Roadmap.findOne({
      _id: roadmapId,
      userId,
    });

    if (!roadmap) {
      return null;
    }

    const roadmapNode = roadmap.nodes.find((node) => node.nodeId === nodeId);

    if (!roadmapNode) {
      throw new Error(`Node not found in roadmap: ${nodeId}`);
    }

    const now = new Date();

    roadmapNode.status = status;
    roadmapNode.updatedAt = now;

    // --------------------------------
    // Learning
    // --------------------------------
    if (status === ROADMAP_NODE_STATUSES.LEARNING) {
      roadmapNode.startedAt ??= now;
    }

    // --------------------------------
    // Completed
    // --------------------------------
    if (status === ROADMAP_NODE_STATUSES.COMPLETED) {
      roadmapNode.startedAt ??= now;
      roadmapNode.completedAt = now;
      roadmapNode.skippedReason = null;
    }

    // --------------------------------
    // Skipped
    // --------------------------------
    if (status === ROADMAP_NODE_STATUSES.SKIPPED) {
      roadmapNode.completedAt = null;
    }

    // --------------------------------
    // Not started
    // --------------------------------
    if (status === ROADMAP_NODE_STATUSES.NOT_STARTED) {
      roadmapNode.completedAt = null;
      roadmapNode.skippedReason = null;
    }

    await roadmap.save();

    return this.recalculate(userId, roadmapId);
  }

  /**
   * Mark a node as completed.
   */
  async completeNode(userId, roadmapId, nodeId) {
    return this.updateNodeStatus(
      userId,
      roadmapId,
      nodeId,
      ROADMAP_NODE_STATUSES.COMPLETED,
    );
  }

  /**
   * Mark a node as currently learning.
   */
  async startNode(userId, roadmapId, nodeId) {
    return this.updateNodeStatus(
      userId,
      roadmapId,
      nodeId,
      ROADMAP_NODE_STATUSES.LEARNING,
    );
  }

  /**
   * Mark a node as not started.
   */
  async resetNode(userId, roadmapId, nodeId) {
    return this.updateNodeStatus(
      userId,
      roadmapId,
      nodeId,
      ROADMAP_NODE_STATUSES.NOT_STARTED,
    );
  }

  /**
   * Skip a node.
   */
  async skipNode(userId, roadmapId, nodeId, reason = null) {
    if (!userId) {
      throw new Error("userId is required");
    }

    if (!roadmapId) {
      throw new Error("roadmapId is required");
    }

    if (!nodeId) {
      throw new Error("nodeId is required");
    }

    const roadmap = await Roadmap.findOne({
      _id: roadmapId,
      userId,
    });

    if (!roadmap) {
      return null;
    }

    const roadmapNode = roadmap.nodes.find((node) => node.nodeId === nodeId);

    if (!roadmapNode) {
      throw new Error(`Node not found in roadmap: ${nodeId}`);
    }

    roadmapNode.status = ROADMAP_NODE_STATUSES.SKIPPED;
    roadmapNode.skippedReason = reason?.trim?.() || null;
    roadmapNode.completedAt = null;
    roadmapNode.updatedAt = new Date();

    await roadmap.save();

    return this.recalculate(userId, roadmapId);
  }

  /**
   * Get current progress without changing the database.
   */
  async getProgress(userId, roadmapId) {
    if (!userId) {
      throw new Error("userId is required");
    }

    if (!roadmapId) {
      throw new Error("roadmapId is required");
    }

    const roadmap = await Roadmap.findOne({
      _id: roadmapId,
      userId,
    }).lean();

    if (!roadmap) {
      return null;
    }

    const roadmapTemplate = loadRoadmap(roadmap.templateId);

    return {
      progress: this.calculateProgress(roadmap.nodes),
      currentFocus: this.getCurrentFocus(roadmap.nodes, roadmapTemplate),
    };
  }
}

const progressService = new ProgressService();

export default progressService;
