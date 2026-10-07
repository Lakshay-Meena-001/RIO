import { z } from "zod";

import {
  ROADMAP_DEFAULTS,
  ROADMAP_GENERATION_MODES,
  ROADMAP_LEVELS,
} from "../constants/roadmap.constants.js";

import { roadmapExists } from "../knowledge/loader.js";

/*
|--------------------------------------------------------------------------
| Reusable Schemas
|--------------------------------------------------------------------------
*/

const generationModeSchema = z.enum(Object.values(ROADMAP_GENERATION_MODES));

const levelSchema = z.enum(Object.values(ROADMAP_LEVELS));

const targetSchema = z
  .object({
    compensation: z.coerce.number().nonnegative().optional(),

    currency: z.string().trim().min(1).optional(),

    unit: z.string().trim().min(1).optional(),
  })
  .optional();

const customRequirementsSchema = z
  .object({
    prompt: z.string().trim().optional(),

    goals: z.array(z.string().trim().min(1)).optional(),

    technologies: z.array(z.string().trim().min(1)).optional(),

    exclusions: z.array(z.string().trim().min(1)).optional(),

    projectPreferences: z.string().trim().optional(),
  })
  .optional();

/*
|--------------------------------------------------------------------------
| Generate Roadmap Schema
|--------------------------------------------------------------------------
*/

const generateRoadmapSchema = z
  .object({
    generationMode: generationModeSchema.default(
      ROADMAP_GENERATION_MODES.STANDARD,
    ),

    templateId: z
      .string()
      .trim()
      .min(1, "templateId is required")
      .refine((templateId) => roadmapExists(templateId), {
        message: "Unknown roadmap template",
      }),

    role: z.string().trim().optional(),

    level: levelSchema.default(ROADMAP_DEFAULTS.LEVEL),

    availableHoursPerDay: z.coerce
      .number()
      .positive()
      .max(24)
      .default(ROADMAP_DEFAULTS.AVAILABLE_HOURS_PER_DAY),

    target: targetSchema.default({
      compensation: ROADMAP_DEFAULTS.TARGET_COMPENSATION,

      currency: ROADMAP_DEFAULTS.CURRENCY,

      unit: ROADMAP_DEFAULTS.TARGET_UNIT,
    }),

    resumeId: z.string().trim().min(1).optional(),

    resumeVersion: z.coerce.number().int().positive().optional(),

    manualSkills: z.array(z.string().trim().min(1)).default([]),

    customRequirements: customRequirementsSchema.default({}),

    inputSource: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    /*
     * Resume mode requires resumeId.
     */
    if (
      data.generationMode === ROADMAP_GENERATION_MODES.RESUME &&
      !data.resumeId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["resumeId"],

        message: "resumeId is required for resume roadmap generation",
      });
    }
  });

/*
|--------------------------------------------------------------------------
| Update Node Status Schema
|--------------------------------------------------------------------------
*/

const updateNodeStatusSchema = z.object({
  roadmapId: z.string().trim().min(1, "roadmapId is required"),

  nodeId: z.string().trim().min(1, "nodeId is required"),

  status: z.enum(["not_started", "learning", "completed", "skipped"]),
});

/*
|--------------------------------------------------------------------------
| Skip Node Schema
|--------------------------------------------------------------------------
*/

const skipNodeSchema = z.object({
  roadmapId: z.string().trim().min(1, "roadmapId is required"),

  nodeId: z.string().trim().min(1, "nodeId is required"),

  reason: z.string().trim().max(1000).optional(),
});

/*
|--------------------------------------------------------------------------
| Roadmap ID Schema
|--------------------------------------------------------------------------
*/

const roadmapIdSchema = z.object({
  roadmapId: z.string().trim().min(1, "roadmapId is required"),
});

/*
|--------------------------------------------------------------------------
| List Roadmaps Schema
|--------------------------------------------------------------------------
*/

const listRoadmapsSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),

  skip: z.coerce.number().int().nonnegative().default(0),
});

/*
|--------------------------------------------------------------------------
| Validator Class
|--------------------------------------------------------------------------
*/

class RoadmapValidator {
  /**
   * Validate and parse roadmap generation input.
   *
   * Returns cleaned/normalized data.
   */
  validateGenerate(input = {}) {
    return generateRoadmapSchema.parse(input);
  }

  /**
   * Safe version for controllers that want
   * to handle validation errors themselves.
   */
  safeValidateGenerate(input = {}) {
    return generateRoadmapSchema.safeParse(input);
  }

  /**
   * Validate node status update.
   */
  validateNodeStatus(input = {}) {
    return updateNodeStatusSchema.parse(input);
  }

  /**
   * Validate skip-node request.
   */
  validateSkipNode(input = {}) {
    return skipNodeSchema.parse(input);
  }

  /**
   * Validate roadmap ID.
   */
  validateRoadmapId(input = {}) {
    return roadmapIdSchema.parse(input);
  }

  /**
   * Validate pagination.
   */
  validateList(input = {}) {
    return listRoadmapsSchema.parse(input);
  }
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

const roadmapValidator = new RoadmapValidator();

export {
  generateRoadmapSchema,
  updateNodeStatusSchema,
  skipNodeSchema,
  roadmapIdSchema,
  listRoadmapsSchema,
};

export default roadmapValidator;
