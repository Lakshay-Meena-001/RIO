import { ROADMAP_GENERATION_MODES } from "../constants/roadmap.constants.js";

import { buildRoadmapAdaptationPrompt } from "../prompts/roadmap.adaptation.prompt.js";

class RoadmapAdaptationAgent {
  constructor({ llm = null } = {}) {
    this.llm = llm;
  }

  setLLM(llm) {
    this.llm = llm;
  }

  validateMode(mode) {
    const supportedModes = [
      ROADMAP_GENERATION_MODES.RESUME,
      ROADMAP_GENERATION_MODES.CUSTOM,
    ];

    if (!supportedModes.includes(mode)) {
      throw new Error(`Unsupported adaptation mode: ${mode}`);
    }
  }

  validateResult(result, canonicalNodeIds) {
    if (!result || typeof result !== "object") {
      throw new Error("Roadmap adaptation returned an invalid result");
    }

    if (!Array.isArray(result.nodes)) {
      throw new Error("Roadmap adaptation result must contain nodes[]");
    }

    const seen = new Set();

    for (const node of result.nodes) {
      if (!node || typeof node !== "object") {
        throw new Error("Invalid roadmap adaptation node");
      }

      if (!node.nodeId) {
        throw new Error("Adapted node is missing nodeId");
      }

      if (!canonicalNodeIds.has(node.nodeId)) {
        throw new Error(`LLM returned non-canonical node: ${node.nodeId}`);
      }

      if (seen.has(node.nodeId)) {
        throw new Error(`LLM returned duplicate node: ${node.nodeId}`);
      }

      seen.add(node.nodeId);
    }

    return true;
  }

  parseResponse(response) {
    if (!response) {
      throw new Error("Empty response from roadmap adaptation model");
    }

    if (typeof response === "object") {
      return response;
    }

    if (typeof response !== "string") {
      throw new Error("Unexpected roadmap adaptation response type");
    }

    let text = response.trim();

    if (text.startsWith("```")) {
      text = text
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/i, "")
        .trim();
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(
        `Failed to parse roadmap adaptation JSON: ${error.message}`,
      );
    }
  }

  async callModel(prompt) {
    if (!this.llm) {
      throw new Error("Roadmap adaptation LLM is not configured");
    }

    if (typeof this.llm.generate !== "function") {
      throw new Error("Roadmap adaptation LLM must expose generate(prompt)");
    }

    return this.llm.generate(prompt);
  }

  async adapt({ mode, context }) {
    this.validateMode(mode);

    if (!context) {
      throw new Error("Adaptation context is required");
    }

    const canonicalNodes = context.template?.nodes || [];

    if (!canonicalNodes.length) {
      throw new Error("Canonical roadmap contains no nodes");
    }

    const canonicalNodeIds = new Set(canonicalNodes.map((node) => node.id));

    const prompt = buildRoadmapAdaptationPrompt({
      mode,
      context,
    });

    const rawResponse = await this.callModel(prompt);

    const parsedResponse = this.parseResponse(rawResponse);

    this.validateResult(parsedResponse, canonicalNodeIds);

    return {
      nodes: parsedResponse.nodes,

      summary:
        typeof parsedResponse.summary === "string"
          ? parsedResponse.summary
          : null,
    };
  }
}

const roadmapAdaptationAgent = new RoadmapAdaptationAgent();

export default roadmapAdaptationAgent;
