import {
  ROADMAP_GENERATION_MODES,
  NODE_STATUS,
} from "../constants/roadmap.constants.js";

import { loadRoadmap } from "../knowledge/loader.js";

import { buildRoadmapAdaptationPrompt } from "../prompts/roadmap.adaptation.prompt.js";

// ============================================================
// LLM
// ============================================================

let llmClient = null;

// ============================================================
// CONFIGURE LLM
// ============================================================

function setLLM(client) {
  if (!client || typeof client.generate !== "function") {
    throw new Error("Invalid LLM client");
  }

  llmClient = client;
}

// ============================================================
// VALIDATE MODE
// ============================================================

function validateMode(generationMode) {
  const allowedModes = [
    ROADMAP_GENERATION_MODES.RESUME,
    ROADMAP_GENERATION_MODES.CUSTOM,
  ];

  if (!allowedModes.includes(generationMode)) {
    throw new Error(
      `Roadmap adaptation does not support generation mode: ${generationMode}`,
    );
  }
}

// ============================================================
// VALIDATE NODE STATUS
// ============================================================

function isValidNodeStatus(status) {
  return Object.values(NODE_STATUS).includes(status);
}

// ============================================================
// SAFE JSON EXTRACTION
// ============================================================

function extractJson(response) {
  if (typeof response !== "string") {
    throw new Error("LLM response must be a string");
  }

  const trimmed = response.trim();

  // ----------------------------------------------------------
  // Direct JSON
  // ----------------------------------------------------------

  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue.
  }

  // ----------------------------------------------------------
  // Markdown code block
  // ----------------------------------------------------------

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

  if (fencedMatch) {
    try {
      return JSON.parse(fencedMatch[1]);
    } catch {
      // Continue.
    }
  }

  // ----------------------------------------------------------
  // JSON object inside surrounding text
  // ----------------------------------------------------------

  const firstBrace = trimmed.indexOf("{");

  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const possibleJson = trimmed.slice(firstBrace, lastBrace + 1);

    try {
      return JSON.parse(possibleJson);
    } catch {
      // Continue.
    }
  }

  throw new Error("LLM returned invalid JSON");
}

// ============================================================
// VALIDATE RESPONSE SHAPE
// ============================================================

function validateResponseShape(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new Error("Invalid roadmap adaptation response");
  }

  if (!Array.isArray(result.nodes)) {
    throw new Error("Roadmap adaptation response must contain a nodes array");
  }

  if (result.summary !== undefined && typeof result.summary !== "string") {
    throw new Error("Roadmap adaptation summary must be a string");
  }
}

// ============================================================
// VALIDATE CANONICAL NODES
// ============================================================

function validateCanonicalNodes(template, nodes) {
  const canonicalIds = new Set(template.nodes.map((node) => node.id));

  const seenIds = new Set();

  for (const node of nodes) {
    if (!node || typeof node !== "object") {
      throw new Error("Invalid node returned by roadmap adaptation");
    }

    const nodeId = node.nodeId;

    // --------------------------------------------------------
    // ID
    // --------------------------------------------------------

    if (typeof nodeId !== "string" || !nodeId.trim()) {
      throw new Error("Every adapted node must contain a valid nodeId");
    }

    // --------------------------------------------------------
    // CANONICAL ID
    // --------------------------------------------------------

    if (!canonicalIds.has(nodeId)) {
      throw new Error(`LLM returned a non-canonical roadmap node: ${nodeId}`);
    }

    // --------------------------------------------------------
    // DUPLICATE
    // --------------------------------------------------------

    if (seenIds.has(nodeId)) {
      throw new Error(`LLM returned duplicate roadmap node: ${nodeId}`);
    }

    seenIds.add(nodeId);

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    if (!isValidNodeStatus(node.status)) {
      throw new Error(
        `Invalid roadmap node status for ${nodeId}: ${node.status}`,
      );
    }
  }

  return true;
}

// ============================================================
// NORMALIZE ADAPTED NODES
// ============================================================

function normalizeAdaptedNodes(template, adaptedNodes) {
  const adaptedById = new Map(adaptedNodes.map((node) => [node.nodeId, node]));

  /**
   * IMPORTANT:
   *
   * The LLM is NOT allowed to decide
   * canonical roadmap ordering.
   *
   * We always preserve template order.
   */
  return template.nodes.map((canonicalNode) => {
    const adapted = adaptedById.get(canonicalNode.id);

    // ------------------------------------------------------
    // LLM DID NOT RETURN THIS NODE
    // ------------------------------------------------------

    if (!adapted) {
      return {
        nodeId: canonicalNode.id,

        status: NODE_STATUS.NOT_STARTED,
      };
    }

    // ------------------------------------------------------
    // RETURN ONLY SAFE FIELDS
    // ------------------------------------------------------

    return {
      nodeId: canonicalNode.id,

      status: adapted.status,
    };
  });
}

// ============================================================
// CALL MODEL
// ============================================================

async function callModel(prompt) {
  if (!llmClient) {
    throw new Error("Roadmap adaptation LLM has not been configured");
  }

  return llmClient.generate(prompt);
}

// ============================================================
// ADAPT
// ============================================================

async function adapt({ generationMode, templateId, userContext = {} }) {
  validateMode(generationMode);

  // ----------------------------------------------------------
  // LOAD CANONICAL TEMPLATE
  // ----------------------------------------------------------

  const template = loadRoadmap(templateId);

  if (!template) {
    throw new Error(`Roadmap template not found: ${templateId}`);
  }

  // ----------------------------------------------------------
  // BUILD PROMPT
  // ----------------------------------------------------------

  const prompt = buildRoadmapAdaptationPrompt({
    generationMode,

    template,

    userContext,
  });

  // ----------------------------------------------------------
  // CALL LLM
  // ----------------------------------------------------------

  const rawResponse = await callModel(prompt);

  // ----------------------------------------------------------
  // PARSE
  // ----------------------------------------------------------

  const result = extractJson(rawResponse);

  // ----------------------------------------------------------
  // STRUCTURE VALIDATION
  // ----------------------------------------------------------

  validateResponseShape(result);

  // ----------------------------------------------------------
  // CANONICAL VALIDATION
  // ----------------------------------------------------------

  validateCanonicalNodes(template, result.nodes);

  // ----------------------------------------------------------
  // NORMALIZE
  // ----------------------------------------------------------

  const nodes = normalizeAdaptedNodes(template, result.nodes);

  // ----------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------

  return {
    nodes,

    summary: typeof result.summary === "string" ? result.summary.trim() : "",

    metadata: {
      templateId,
      generationMode,

      adaptedBy: "roadmap-adaptation-agent",
    },
  };
}

// ============================================================
// EXPORTS
// ============================================================

export {
  setLLM,
  adapt,
  validateMode,
  validateCanonicalNodes,
  normalizeAdaptedNodes,
};

export default {
  setLLM,
  adapt,
};
