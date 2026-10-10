
import {
  ROADMAP_PACKAGE,
  ROADMAP_SCHEMA_VERSION,
  ROADMAP_GENERATION,
} from "../constants/roadmap.constants.js";

const VALID_PACKAGES = new Set(Object.values(ROADMAP_PACKAGE));

const VALID_TOPIC_TYPES = new Set([
  "core",
  "optional",
  "advanced",
  "project",
  "specialization",
]);

const VALID_OPTION_TYPES = new Set([
  "alternative",
  "complementary",
  "specialization",
]);

const VALID_GENERATION_STATUSES = new Set([
  "pending",
  "generating",
  "ready",
  "failed",
]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function requireString(value, path, errors) {
  if (!isNonEmptyString(value)) {
    errors.push(`${path} must be a non-empty string.`);
  }
}

function requireStringArray(value, path, errors) {
  if (!isStringArray(value)) {
    errors.push(`${path} must be an array of strings.`);
  }
}

function checkUniqueIds(items, path, errors) {
  if (!Array.isArray(items)) return;

  const ids = new Set();

  items.forEach((item, index) => {
    if (!isNonEmptyString(item?.id)) {
      errors.push(`${path}[${index}].id is required.`);
      return;
    }

    if (ids.has(item.id)) {
      errors.push(`${path} contains duplicate ID "${item.id}".`);
    }

    ids.add(item.id);
  });
}

function validateStringArrayFields(object, fields, path, errors) {
  for (const field of fields) {
    if (object[field] !== undefined) {
      requireStringArray(object[field], `${path}.${field}`, errors);
    }
  }
}

function validateResource(resource, path, errors) {
  if (!isObject(resource)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  requireString(resource.title, `${path}.title`, errors);
  requireString(resource.url, `${path}.url`, errors);

  if (isNonEmptyString(resource.url)) {
    try {
      const url = new URL(resource.url);

      if (!["http:", "https:"].includes(url.protocol)) {
        errors.push(`${path}.url must use HTTP or HTTPS.`);
      }
    } catch {
      errors.push(`${path}.url must be a valid URL.`);
    }
  }

  if (resource.type !== undefined) {
    requireString(resource.type, `${path}.type`, errors);
  }
}

function validateTopicOption(option, path, errors) {
  if (!isObject(option)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  requireString(option.id, `${path}.id`, errors);
  requireString(option.title, `${path}.title`, errors);

  if (option.type !== undefined && !VALID_OPTION_TYPES.has(option.type)) {
    errors.push(`${path}.type is invalid.`);
  }

  validateStringArrayFields(
    option,
    ["prerequisites", "tradeoffs"],
    path,
    errors,
  );
}

function validateTopic(topic, path, errors) {
  if (!isObject(topic)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  requireString(topic.id, `${path}.id`, errors);
  requireString(topic.title, `${path}.title`, errors);
  requireString(topic.description, `${path}.description`, errors);

  if (topic.type !== undefined && !VALID_TOPIC_TYPES.has(topic.type)) {
    errors.push(`${path}.type is invalid.`);
  }

  if (
    topic.estimatedHours !== undefined &&
    (!Number.isFinite(topic.estimatedHours) || topic.estimatedHours < 0)
  ) {
    errors.push(`${path}.estimatedHours must be non-negative.`);
  }

  validateStringArrayFields(
    topic,
    [
      "prerequisites",
      "subtopics",
      "practiceTasks",
      "completionCriteria",
    ],
    path,
    errors,
  );

  if (topic.resources !== undefined) {
    if (!Array.isArray(topic.resources)) {
      errors.push(`${path}.resources must be an array.`);
    } else {
      if (
        topic.resources.length >
        ROADMAP_GENERATION.MAX_RESOURCES_PER_TOPIC
      ) {
        errors.push(
          `${path}.resources exceeds the maximum of ${ROADMAP_GENERATION.MAX_RESOURCES_PER_TOPIC}.`,
        );
      }

      topic.resources.forEach((resource, index) =>
        validateResource(resource, `${path}.resources[${index}]`, errors),
      );
    }
  }

  if (topic.options !== undefined) {
    if (!Array.isArray(topic.options)) {
      errors.push(`${path}.options must be an array.`);
    } else {
      checkUniqueIds(topic.options, `${path}.options`, errors);

      topic.options.forEach((option, index) =>
        validateTopicOption(option, `${path}.options[${index}]`, errors),
      );
    }
  }
}

function validateProject(project, path, errors) {
  if (!isObject(project)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  for (const field of ["id", "title", "description"]) {
    requireString(project[field], `${path}.${field}`, errors);
  }

  validateStringArrayFields(
    project,
    ["requirements", "skillsPracticed", "completionCriteria"],
    path,
    errors,
  );
}

function validatePhaseContent(phase, expected = {}) {
  const errors = [];

  if (!isObject(phase)) {
    return {
      valid: false,
      errors: ["phase must be a JSON object."],
      data: null,
    };
  }

  requireString(phase.id, "phase.id", errors);
  requireString(phase.title, "phase.title", errors);
  requireString(phase.purpose, "phase.purpose", errors);

  if (!Number.isInteger(phase.order) || phase.order < 0) {
    errors.push("phase.order must be a non-negative integer.");
  }

  if (expected.phaseId && phase.id !== expected.phaseId) {
    errors.push("Generated phase ID does not match the requested phase.");
  }

  if (
    Number.isInteger(expected.order) &&
    phase.order !== expected.order
  ) {
    errors.push("Generated phase order does not match the requested order.");
  }

  validateStringArrayFields(
    phase,
    ["prerequisites", "learningOutcomes", "completionCriteria"],
    "phase",
    errors,
  );

  if (!Array.isArray(phase.topics) || phase.topics.length === 0) {
    errors.push("phase.topics must contain at least one topic.");
  } else {
    if (phase.topics.length > ROADMAP_GENERATION.MAX_TOPICS_PER_PHASE) {
      errors.push(
        `phase.topics exceeds the maximum of ${ROADMAP_GENERATION.MAX_TOPICS_PER_PHASE}.`,
      );
    }

    checkUniqueIds(phase.topics, "phase.topics", errors);

    phase.topics.forEach((topic, index) =>
      validateTopic(topic, `phase.topics[${index}]`, errors),
    );
  }

  if (phase.projects !== undefined) {
    if (!Array.isArray(phase.projects)) {
      errors.push("phase.projects must be an array.");
    } else {
      checkUniqueIds(phase.projects, "phase.projects", errors);

      phase.projects.forEach((project, index) =>
        validateProject(project, `phase.projects[${index}]`, errors),
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? phase : null,
  };
}

function validateOutlinePhase(phase, index, errors) {
  const path = `phases[${index}]`;

  if (!isObject(phase)) {
    errors.push(`${path} must be an object.`);
    return;
  }

  requireString(phase.id, `${path}.id`, errors);
  requireString(phase.title, `${path}.title`, errors);
  requireString(phase.purpose, `${path}.purpose`, errors);

  if (phase.order !== index) {
    errors.push(`${path}.order must equal ${index}.`);
  }

  validateStringArrayFields(
    phase,
    ["prerequisites", "learningOutcomes", "topicsOutline"],
    path,
    errors,
  );
}

export function validateRoadmapRequest(input) {
  const errors = [];

  if (!isObject(input)) {
    return {
      valid: false,
      errors: ["Request body must be an object."],
    };
  }

  requireString(input.roadmapId, "roadmapId", errors);

  if (!VALID_PACKAGES.has(input.packageId)) {
    errors.push(
      `packageId must be one of: ${[...VALID_PACKAGES].join(", ")}.`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateGeneratedBlueprint(blueprint, expected = {}) {
  const errors = [];

  if (!isObject(blueprint)) {
    return {
      valid: false,
      errors: ["Generated blueprint must be a JSON object."],
      data: null,
    };
  }

  if (blueprint.schemaVersion !== ROADMAP_SCHEMA_VERSION) {
    errors.push("Generated blueprint schemaVersion is unsupported.");
  }

  requireString(blueprint.roadmapId, "roadmapId", errors);
  requireString(blueprint.title, "title", errors);
  requireString(blueprint.summary, "summary", errors);

  if (expected.roadmapId && blueprint.roadmapId !== expected.roadmapId) {
    errors.push("Blueprint roadmap ID does not match the request.");
  }

  if (!VALID_PACKAGES.has(blueprint.packageId)) {
    errors.push("Blueprint packageId is invalid.");
  }

  if (
    expected.packageId &&
    blueprint.packageId !== expected.packageId
  ) {
    errors.push("Blueprint packageId does not match the request.");
  }

  if (!Array.isArray(blueprint.phases) || blueprint.phases.length === 0) {
    errors.push("Blueprint must contain at least one phase.");
  } else {
    if (blueprint.phases.length > ROADMAP_GENERATION.MAX_PHASES) {
      errors.push(
        `Blueprint exceeds the maximum of ${ROADMAP_GENERATION.MAX_PHASES} phases.`,
      );
    }

    checkUniqueIds(blueprint.phases, "phases", errors);

    blueprint.phases.forEach((phase, index) =>
      validateOutlinePhase(phase, index, errors),
    );

    const phaseIds = new Set(
      blueprint.phases.map((phase) => phase?.id).filter(isNonEmptyString),
    );

    blueprint.phases.forEach((phase, index) => {
      if (!Array.isArray(phase?.prerequisites)) return;

      phase.prerequisites.forEach((prerequisite) => {
        if (!phaseIds.has(prerequisite)) {
          errors.push(
            `phases[${index}].prerequisites references unknown phase "${prerequisite}".`,
          );
        }

        if (prerequisite === phase.id) {
          errors.push(`phases[${index}] cannot depend on itself.`);
        }
      });
    });
  }

  for (const field of [
    "learningPathOutlines",
    "decisionGuideOutlines",
    "capstoneOutlines",
  ]) {
    if (blueprint[field] !== undefined && !Array.isArray(blueprint[field])) {
      errors.push(`${field} must be an array.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? blueprint : null,
  };
}

export function validateGeneratedPhase(phase, expected = {}) {
  return validatePhaseContent(phase, expected);
}

export function validateGeneratedRoadmap(roadmap, expected = {}) {
  const errors = [];

  if (!isObject(roadmap)) {
    return {
      valid: false,
      errors: ["Generated roadmap must be a JSON object."],
    };
  }

  if (roadmap.schemaVersion !== ROADMAP_SCHEMA_VERSION) {
    errors.push("Generated roadmap schemaVersion is unsupported.");
  }

  requireString(roadmap.roadmapId, "roadmapId", errors);
  requireString(roadmap.title, "title", errors);
  requireString(roadmap.summary, "summary", errors);

  if (expected.roadmapId && roadmap.roadmapId !== expected.roadmapId) {
    errors.push("Generated roadmap ID does not match the requested roadmap.");
  }

  if (!isObject(roadmap.package)) {
    errors.push("package must be an object.");
  } else {
    requireString(roadmap.package.id, "package.id", errors);

    if (
      expected.packageId &&
      roadmap.package.id !== expected.packageId
    ) {
      errors.push("Generated package does not match the requested package.");
    }
  }

  validateStringArrayFields(
    roadmap,
    ["learningOutcomes", "finalReadinessChecklist"],
    "roadmap",
    errors,
  );

  if (!Array.isArray(roadmap.phases) || roadmap.phases.length === 0) {
    errors.push("phases must contain at least one phase.");
  } else {
    if (roadmap.phases.length > ROADMAP_GENERATION.MAX_PHASES) {
      errors.push("Roadmap exceeds the maximum number of phases.");
    }

    checkUniqueIds(roadmap.phases, "phases", errors);

    roadmap.phases.forEach((phase, index) => {
      if (!isObject(phase)) {
        errors.push(`phases[${index}] must be an object.`);
        return;
      }

      if (phase.generationStatus === "ready") {
        const result = validatePhaseContent(phase, {
          phaseId: phase.id,
          order: index,
        });

        errors.push(...result.errors.map((error) => `phases[${index}]: ${error}`));
      } else if (
        phase.generationStatus !== undefined &&
        !VALID_GENERATION_STATUSES.has(phase.generationStatus)
      ) {
        errors.push(`phases[${index}].generationStatus is invalid.`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? roadmap : null,
  };
}

function parseJSON(rawResponse, label) {
  if (typeof rawResponse !== "string" || !rawResponse.trim()) {
    return {
      valid: false,
      errors: [`${label} response must be a non-empty string.`],
      data: null,
    };
  }

  try {
    return {
      valid: true,
      errors: [],
      data: JSON.parse(rawResponse),
    };
  } catch {
    return {
      valid: false,
      errors: [`${label} response is not valid JSON.`],
      data: null,
    };
  }
}

export function parseAndValidateGeneratedBlueprint(rawResponse, expected = {}) {
  const parsed = parseJSON(rawResponse, "Blueprint");

  if (!parsed.valid) return parsed;

  return validateGeneratedBlueprint(parsed.data, expected);
}

export function parseAndValidateGeneratedPhase(rawResponse, expected = {}) {
  const parsed = parseJSON(rawResponse, "Phase");

  if (!parsed.valid) return parsed;

  return validateGeneratedPhase(parsed.data, expected);
}

export function parseAndValidateGeneratedRoadmap(rawResponse, expected = {}) {
  const parsed = parseJSON(rawResponse, "Roadmap");

  if (!parsed.valid) return parsed;

  const validation = validateGeneratedRoadmap(parsed.data, expected);

  return {
    ...validation,
    data: validation.valid ? parsed.data : null,
  };
}

export default {
  validateRoadmapRequest,
  validateGeneratedBlueprint,
  validateGeneratedPhase,
  validateGeneratedRoadmap,
  parseAndValidateGeneratedBlueprint,
  parseAndValidateGeneratedPhase,
  parseAndValidateGeneratedRoadmap,
};
