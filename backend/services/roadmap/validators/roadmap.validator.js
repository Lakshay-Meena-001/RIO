import { z } from "zod";

import {
  ROADMAP_GENERATION_MODES,
  ROADMAP_LEVELS,
  ROADMAP_INPUT_SOURCES,
} from "../constants/roadmap.constants.js";

import { roadmapExists } from "../knowledge/loader.js";

// ============================================================
// COMMON SCHEMAS
// ============================================================

const generationModeSchema = z.enum(Object.values(ROADMAP_GENERATION_MODES));

const levelSchema = z.enum(Object.values(ROADMAP_LEVELS));

const targetSchema = z
  .object({
    compensation: z.coerce.number().min(0).max(1000).default(12),

    currency: z.string().trim().min(1).default("INR"),

    unit: z.string().trim().min(1).default("LPA"),
  })
  .default({});

const customRequirementsSchema = z
  .object({
    prompt: z.string().trim().max(10000).optional().default(""),

    goals: z.array(z.string().trim().min(1).max(500)).max(50).default([]),

    technologies: z
      .array(z.string().trim().min(1).max(100))
      .max(100)
      .default([]),

    exclusions: z.array(z.string().trim().min(1).max(200)).max(100).default([]),

    projectPreferences: z
      .array(z.string().trim().min(1).max(500))
      .max(50)
      .default([]),

    notes: z.string().trim().max(5000).optional().default(""),
  })
  .default({});

// ============================================================
// TEMPLATE ID
// ============================================================

const templateIdSchema = z
  .string()
  .trim()
  .min(1)
  .refine((templateId) => roadmapExists(templateId), {
    message: "Invalid roadmap template",
  });

// ============================================================
// GENERATE ROADMAP
// ============================================================

const generateRoadmapSchema = z
  .object({
    generationMode: generationModeSchema.default(
      ROADMAP_GENERATION_MODES.STANDARD,
    ),

    templateId: templateIdSchema,

    role: z.string().trim().max(200).optional().default(""),

    level: levelSchema.default(ROADMAP_LEVELS.BEGINNER),

    availableHoursPerDay: z.coerce.number().min(0).max(24).default(2),

    target: targetSchema,

    resumeId: z.string().trim().min(1).optional().nullable().default(null),

    resumeVersion: z
      .union([z.string().trim().min(1), z.number().int().positive()])
      .optional()
      .nullable()
      .default(null),

    manualSkills: z
      .array(z.string().trim().min(1).max(100))
      .max(200)
      .default([]),

    customRequirements: customRequirementsSchema,

    inputSource: z.enum(Object.values(ROADMAP_INPUT_SOURCES)).optional(),
  })
  .superRefine((data, ctx) => {
    // ----------------------------------------------------
    // RESUME MODE
    // ----------------------------------------------------

    if (
      data.generationMode === ROADMAP_GENERATION_MODES.RESUME &&
      !data.resumeId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["resumeId"],
        message: "resumeId is required for resume-based roadmap generation",
      });
    }

    // ----------------------------------------------------
    // CUSTOM MODE
    // ----------------------------------------------------

    if (data.generationMode === ROADMAP_GENERATION_MODES.CUSTOM) {
      const hasPrompt = Boolean(data.customRequirements?.prompt?.trim());

      const hasGoals = data.customRequirements?.goals?.length > 0;

      const hasTechnologies = data.customRequirements?.technologies?.length > 0;

      const hasExclusions = data.customRequirements?.exclusions?.length > 0;

      const hasProjectPreferences =
        data.customRequirements?.projectPreferences?.length > 0;

      if (
        !hasPrompt &&
        !hasGoals &&
        !hasTechnologies &&
        !hasExclusions &&
        !hasProjectPreferences
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customRequirements"],
          message:
            "Custom roadmap generation requires at least one custom requirement",
        });
      }
    }
  });

// ============================================================
// UPDATE NODE STATUS
// ============================================================

const updateNodeStatusSchema = z.object({
  status: z.string().trim().min(1),
});

// ============================================================
// SKIP NODE
// ============================================================

const skipNodeSchema = z.object({
  reason: z.string().trim().max(1000).optional().nullable().default(null),
});

// ============================================================
// ROADMAP ID
// ============================================================

const roadmapIdSchema = z.object({
  roadmapId: z.string().trim().min(1),
});

// ============================================================
// LIST ROADMAPS
// ============================================================

const listRoadmapsSchema = z.object({
  status: z.string().trim().optional(),

  generationMode: generationModeSchema.optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================================
// VALIDATOR CLASS
// ============================================================

class RoadmapValidator {
  validateGenerate(input) {
    return generateRoadmapSchema.parse(input);
  }

  validateUpdateNodeStatus(input) {
    return updateNodeStatusSchema.parse(input);
  }

  validateSkipNode(input) {
    return skipNodeSchema.parse(input);
  }

  validateRoadmapId(input) {
    return roadmapIdSchema.parse(input);
  }

  validateList(input) {
    return listRoadmapsSchema.parse(input);
  }

  safeValidateGenerate(input) {
    return generateRoadmapSchema.safeParse(input);
  }

  safeValidateUpdateNodeStatus(input) {
    return updateNodeStatusSchema.safeParse(input);
  }

  safeValidateSkipNode(input) {
    return skipNodeSchema.safeParse(input);
  }

  safeValidateRoadmapId(input) {
    return roadmapIdSchema.safeParse(input);
  }

  safeValidateList(input) {
    return listRoadmapsSchema.safeParse(input);
  }
}

// ============================================================
// EXPORTS
// ============================================================

const roadmapValidator = new RoadmapValidator();

export {
  generateRoadmapSchema,
  updateNodeStatusSchema,
  skipNodeSchema,
  roadmapIdSchema,
  listRoadmapsSchema,
};

export default roadmapValidator;
