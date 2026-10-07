import { z } from "zod";

import {
  ROADMAP_GENERATION_MODES,
  EXPERIENCE_LEVELS,
  ROADMAP_INPUT_SOURCES,
} from "../constants/roadmap.constants.js";

import { roadmapExists } from "../knowledge/loader.js";

// ============================================================
// COMMON SCHEMAS
// ============================================================

const generationModeSchema = z.enum(Object.values(ROADMAP_GENERATION_MODES));

const levelSchema = z.enum(Object.values(EXPERIENCE_LEVELS));

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
// RESUME ID
// ============================================================

const resumeIdSchema = z
  .string()
  .trim()
  .min(1)
  .nullable()
  .optional()
  .default(null);

// ============================================================
// RESUME VERSION
// ============================================================

const resumeVersionSchema = z
  .union([z.string().trim().min(1), z.number().int().positive()])
  .nullable()
  .optional()
  .default(null);

// ============================================================
// MANUAL SKILLS
// ============================================================

const manualSkillsSchema = z
  .array(z.string().trim().min(1).max(100))
  .max(200)
  .default([]);

// ============================================================
// CREATE DRAFT
// ============================================================

const createDraftSchema = z
  .object({
    generationMode: generationModeSchema.default(
      ROADMAP_GENERATION_MODES.STANDARD,
    ),

    role: z.string().trim().max(200).optional().default(""),

    templateId: templateIdSchema.nullable().optional().default(null),

    target: targetSchema,

    level: levelSchema.default(EXPERIENCE_LEVELS.BEGINNER),

    availableHoursPerDay: z.coerce.number().min(0).max(24).default(2),

    useResume: z.boolean().default(false),

    resumeId: resumeIdSchema,

    resumeVersion: resumeVersionSchema,

    manualSkills: manualSkillsSchema,

    customRequirements: customRequirementsSchema,

    inputSource: z.enum(Object.values(ROADMAP_INPUT_SOURCES)).optional(),

    currentStep: z.coerce.number().int().min(0).max(100).default(0),
  })
  .superRefine((data, ctx) => {
    // ------------------------------------------------------
    // RESUME SELECTION
    // ------------------------------------------------------

    if (data.useResume && !data.resumeId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["resumeId"],

        message: "resumeId is required when useResume is enabled",
      });
    }

    // ------------------------------------------------------
    // RESUME ID WITHOUT RESUME MODE
    // ------------------------------------------------------

    if (data.resumeId && !data.useResume) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["useResume"],

        message: "useResume must be enabled when a resumeId is provided",
      });
    }

    // ------------------------------------------------------
    // STANDARD MODE
    // ------------------------------------------------------

    if (data.generationMode === ROADMAP_GENERATION_MODES.STANDARD) {
      /**
       * Standard roadmap does not require
       * resume or custom requirements.
       *
       * Extra builder state is allowed because
       * the user may switch modes later.
       */
    }

    // ------------------------------------------------------
    // RESUME MODE
    // ------------------------------------------------------

    if (
      data.generationMode === ROADMAP_GENERATION_MODES.RESUME &&
      !data.useResume
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["useResume"],

        message: "Resume generation mode requires useResume to be enabled",
      });
    }

    // ------------------------------------------------------
    // CUSTOM MODE
    // ------------------------------------------------------

    if (data.generationMode === ROADMAP_GENERATION_MODES.CUSTOM) {
      const custom = data.customRequirements;

      const hasPrompt = Boolean(custom?.prompt?.trim());

      const hasGoals = custom?.goals?.length > 0;

      const hasTechnologies = custom?.technologies?.length > 0;

      const hasExclusions = custom?.exclusions?.length > 0;

      const hasProjects = custom?.projectPreferences?.length > 0;

      const hasNotes = Boolean(custom?.notes?.trim());

      if (
        !hasPrompt &&
        !hasGoals &&
        !hasTechnologies &&
        !hasExclusions &&
        !hasProjects &&
        !hasNotes
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
// UPDATE DRAFT
// ============================================================

/**
 * Every field is optional during a draft update.
 *
 * Example:
 *
 * Step 1:
 *   role
 *
 * Step 2:
 *   level
 *
 * Step 3:
 *   target
 *
 * Step 4:
 *   resume
 *
 * The frontend does not need to send the
 * complete builder state every time.
 */
const updateDraftSchema = z
  .object({
    generationMode: generationModeSchema.optional(),

    role: z.string().trim().max(200).optional(),

    templateId: templateIdSchema.nullable().optional(),

    target: targetSchema.optional(),

    level: levelSchema.optional(),

    availableHoursPerDay: z.coerce.number().min(0).max(24).optional(),

    useResume: z.boolean().optional(),

    resumeId: resumeIdSchema.optional(),

    resumeVersion: resumeVersionSchema.optional(),

    manualSkills: manualSkillsSchema.optional(),

    customRequirements: customRequirementsSchema.optional(),

    inputSource: z.enum(Object.values(ROADMAP_INPUT_SOURCES)).optional(),

    currentStep: z.coerce.number().int().min(0).max(100).optional(),

    readyForGeneration: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    /**
     * Only validate relationships when
     * the relevant fields are actually
     * being updated together.
     *
     * This prevents PATCH requests such as:
     *
     * { currentStep: 3 }
     *
     * from failing because the draft
     * doesn't contain every other field.
     */

    if (data.useResume === false && data.resumeId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["resumeId"],

        message: "resumeId cannot be provided when useResume is false",
      });
    }

    if (
      data.generationMode === ROADMAP_GENERATION_MODES.RESUME &&
      data.useResume === false
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["useResume"],

        message: "Resume generation mode requires useResume to be enabled",
      });
    }
  });

// ============================================================
// DRAFT ID
// ============================================================

const draftIdSchema = z.object({
  draftId: z.string().trim().min(1),
});

// ============================================================
// CURRENT STEP
// ============================================================

const updateCurrentStepSchema = z.object({
  currentStep: z.coerce.number().int().min(0).max(100),
});

// ============================================================
// MARK GENERATED
// ============================================================

const markGeneratedSchema = z.object({
  roadmapId: z.string().trim().min(1),
});

// ============================================================
// VALIDATOR CLASS
// ============================================================

class DraftValidator {
  validateCreate(input) {
    return createDraftSchema.parse(input);
  }

  validateUpdate(input) {
    return updateDraftSchema.parse(input);
  }

  validateDraftId(input) {
    return draftIdSchema.parse(input);
  }

  validateCurrentStep(input) {
    return updateCurrentStepSchema.parse(input);
  }

  validateMarkGenerated(input) {
    return markGeneratedSchema.parse(input);
  }

  safeValidateCreate(input) {
    return createDraftSchema.safeParse(input);
  }

  safeValidateUpdate(input) {
    return updateDraftSchema.safeParse(input);
  }

  safeValidateDraftId(input) {
    return draftIdSchema.safeParse(input);
  }

  safeValidateCurrentStep(input) {
    return updateCurrentStepSchema.safeParse(input);
  }

  safeValidateMarkGenerated(input) {
    return markGeneratedSchema.safeParse(input);
  }
}

// ============================================================
// EXPORTS
// ============================================================

const draftValidator = new DraftValidator();

export {
  createDraftSchema,
  updateDraftSchema,
  draftIdSchema,
  updateCurrentStepSchema,
  markGeneratedSchema,
};

export default draftValidator;
