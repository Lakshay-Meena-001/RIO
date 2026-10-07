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
| Create Draft
|--------------------------------------------------------------------------
*/

const createDraftSchema = z.object({
  generationMode: generationModeSchema.default(
    ROADMAP_GENERATION_MODES.STANDARD,
  ),

  role: z.string().trim().optional(),

  templateId: z
    .string()
    .trim()
    .min(1)
    .nullable()
    .optional()
    .refine((value) => value == null || roadmapExists(value), {
      message: "Unknown roadmap template",
    }),

  target: targetSchema.default({
    compensation: ROADMAP_DEFAULTS.TARGET_COMPENSATION,

    currency: ROADMAP_DEFAULTS.CURRENCY,

    unit: ROADMAP_DEFAULTS.TARGET_UNIT,
  }),

  level: levelSchema.default(ROADMAP_DEFAULTS.LEVEL),

  availableHoursPerDay: z.coerce
    .number()
    .positive()
    .max(24)
    .default(ROADMAP_DEFAULTS.AVAILABLE_HOURS_PER_DAY),

  useResume: z.boolean().default(false),

  resumeId: z.string().trim().min(1).nullable().optional(),

  resumeVersion: z.coerce.number().int().positive().nullable().optional(),

  manualSkills: z.array(z.string().trim().min(1)).default([]),

  customRequirements: customRequirementsSchema.default({}),

  inputSource: z.string().trim().nullable().optional(),

  currentStep: z.coerce.number().int().nonnegative().default(0),
});

/*
|--------------------------------------------------------------------------
| Update Draft
|--------------------------------------------------------------------------
|
| Partial schema because builder saves one section at a time.
|
*/

const updateDraftSchema = createDraftSchema.partial();

/*
|--------------------------------------------------------------------------
| Draft ID
|--------------------------------------------------------------------------
*/

const draftIdSchema = z.object({
  draftId: z.string().trim().min(1, "draftId is required"),
});

/*
|--------------------------------------------------------------------------
| Update Current Step
|--------------------------------------------------------------------------
*/

const updateCurrentStepSchema = z.object({
  draftId: z.string().trim().min(1, "draftId is required"),

  currentStep: z.coerce.number().int().nonnegative(),
});

/*
|--------------------------------------------------------------------------
| Mark Generated
|--------------------------------------------------------------------------
*/

const markGeneratedSchema = z.object({
  draftId: z.string().trim().min(1, "draftId is required"),

  generatedRoadmapId: z
    .string()
    .trim()
    .min(1, "generatedRoadmapId is required"),
});

/*
|--------------------------------------------------------------------------
| Validator Class
|--------------------------------------------------------------------------
*/

class DraftValidator {
  /**
   * Validate create draft request.
   */
  validateCreate(input = {}) {
    return createDraftSchema.parse(input);
  }

  /**
   * Validate partial draft update.
   */
  validateUpdate(input = {}) {
    return updateDraftSchema.parse(input);
  }

  /**
   * Validate draft ID.
   */
  validateDraftId(input = {}) {
    return draftIdSchema.parse(input);
  }

  /**
   * Validate current step update.
   */
  validateCurrentStep(input = {}) {
    return updateCurrentStepSchema.parse(input);
  }

  /**
   * Validate generated roadmap linking.
   */
  validateMarkGenerated(input = {}) {
    return markGeneratedSchema.parse(input);
  }

  /**
   * Safe validation for controller-level handling.
   */
  safeValidateCreate(input = {}) {
    return createDraftSchema.safeParse(input);
  }

  safeValidateUpdate(input = {}) {
    return updateDraftSchema.safeParse(input);
  }
}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

const draftValidator = new DraftValidator();

export {
  createDraftSchema,
  updateDraftSchema,
  draftIdSchema,
  updateCurrentStepSchema,
  markGeneratedSchema,
};

export default draftValidator;
