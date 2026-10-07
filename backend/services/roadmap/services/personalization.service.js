import {
  ROADMAP_GENERATION_MODES,
  ROADMAP_NODE_STATUSES,
} from "../constants/roadmap.constants.js";

import { loadRoadmap } from "../knowledge/loader.js";

import { getLLMClient } from "../config/llm.js";

import roadmapAdaptationAgent from "../agents/roadmap.adaptation.agent.js";

class PersonalizationService {
  buildAdaptationContext({ template, input, resume = null }) {
    return {
      template: {
        id: template.id,
        version: template.version,
        title: template.title,
        description: template.description,
        goal: template.goal,

        phases: template.metadata?.phases || [],
        progression: template.metadata?.progression || [],

        nodes: template.nodes,
        edges: template.edges,

        alternatives: template.alternatives || [],
      },

      user: {
        role: input.role || null,

        level: input.level || null,

        availableHoursPerDay: input.availableHoursPerDay ?? null,

        target: {
          compensation: input.target?.compensation ?? null,

          currency: input.target?.currency || "INR",

          unit: input.target?.unit || "LPA",
        },

        manualSkills: input.manualSkills || [],
      },

      resume: resume
        ? {
            id: resume.id || resume._id || null,

            version: resume.version ?? null,

            profile: resume.profile || null,

            summary: resume.summary || null,

            skills: resume.skills || null,

            technologies: resume.technologies || null,

            experience: resume.experience || null,

            projects: resume.projects || null,

            education: resume.education || null,
          }
        : null,

      customRequirements: input.customRequirements || {},
    };
  }

  validateAdaptedNodes(adaptedNodes, template) {
    if (!Array.isArray(adaptedNodes)) {
      throw new Error("Adaptation result must contain an array of nodes");
    }

    const canonicalNodeIds = new Set(template.nodes.map((node) => node.id));

    const seenNodeIds = new Set();

    for (const node of adaptedNodes) {
      if (!node || !node.nodeId) {
        throw new Error("Every adapted roadmap node must contain nodeId");
      }

      if (!canonicalNodeIds.has(node.nodeId)) {
        throw new Error(
          `Unknown roadmap node returned by adaptation: ${node.nodeId}`,
        );
      }

      if (seenNodeIds.has(node.nodeId)) {
        throw new Error(`Duplicate roadmap node returned: ${node.nodeId}`);
      }

      seenNodeIds.add(node.nodeId);

      const validStatuses = Object.values(ROADMAP_NODE_STATUSES);

      if (node.status && !validStatuses.includes(node.status)) {
        throw new Error(`Invalid adapted node status: ${node.status}`);
      }
    }

    return true;
  }

  normalizeAdaptedNodes(adaptedNodes, template) {
    const adaptedMap = new Map(adaptedNodes.map((node) => [node.nodeId, node]));

    return template.nodes.map((canonicalNode) => {
      const adapted = adaptedMap.get(canonicalNode.id);

      if (!adapted) {
        return {
          nodeId: canonicalNode.id,

          status: ROADMAP_NODE_STATUSES.NOT_STARTED,

          skippedReason: null,
          startedAt: null,
          completedAt: null,
          updatedAt: new Date(),
        };
      }

      return {
        nodeId: canonicalNode.id,

        status: adapted.status || ROADMAP_NODE_STATUSES.NOT_STARTED,

        skippedReason: adapted.skippedReason || null,

        startedAt: adapted.startedAt || null,

        completedAt: adapted.completedAt || null,

        updatedAt: new Date(),
      };
    });
  }

  async adapt({ generationMode, templateId, input, resume = null }) {
    if (generationMode === ROADMAP_GENERATION_MODES.STANDARD) {
      throw new Error("Standard roadmap does not require personalization");
    }

    const template = loadRoadmap(templateId);

    const context = this.buildAdaptationContext({
      template,
      input,
      resume,
    });

    /*
     * LLM client is created lazily.
     *
     * Therefore standard roadmap generation never
     * initializes the LLM.
     */
    const llm = await getLLMClient();

    roadmapAdaptationAgent.setLLM(llm);

    const result = await roadmapAdaptationAgent.adapt({
      mode: generationMode,
      context,
    });

    const adaptedNodes = result?.nodes || [];

    this.validateAdaptedNodes(adaptedNodes, template);

    const normalizedNodes = this.normalizeAdaptedNodes(adaptedNodes, template);

    return {
      nodes: normalizedNodes,

      metadata: {
        adapted: true,

        mode: generationMode,

        templateId: template.id,

        templateVersion: template.version,

        adaptationSummary: result?.summary || null,
      },
    };
  }

  resolveMode({ generationMode, useResume = false, hasManualSkills = false }) {
    if (generationMode === ROADMAP_GENERATION_MODES.STANDARD) {
      return ROADMAP_GENERATION_MODES.STANDARD;
    }

    if (generationMode === ROADMAP_GENERATION_MODES.RESUME) {
      return ROADMAP_GENERATION_MODES.RESUME;
    }

    if (generationMode === ROADMAP_GENERATION_MODES.CUSTOM) {
      return ROADMAP_GENERATION_MODES.CUSTOM;
    }

    if (useResume) {
      return ROADMAP_GENERATION_MODES.RESUME;
    }

    if (hasManualSkills) {
      return ROADMAP_GENERATION_MODES.CUSTOM;
    }

    return ROADMAP_GENERATION_MODES.STANDARD;
  }
}

const personalizationService = new PersonalizationService();

export default personalizationService;
