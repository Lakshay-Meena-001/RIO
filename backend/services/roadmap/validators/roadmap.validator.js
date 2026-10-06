import { z } from "zod";

const nonEmptyString = (max) => z.string().trim().min(1).max(max);

const resourceSchema = z.object({
  type: z.enum(["youtube", "article", "documentation", "course"]),

  title: nonEmptyString(200),

  url: z.string().trim().url(),

  source: nonEmptyString(100),

  isPrimary: z.boolean().default(false),

  reason: z.string().trim().max(300).nullable().optional(),

  publishedAt: z.coerce.date().nullable().optional(),

  durationMinutes: z.number().min(0).nullable().optional(),

  viewCount: z.number().int().min(0).nullable().optional(),
});

const moduleSchema = z.object({
  order: z.number().int().min(1),

  title: nonEmptyString(200),

  duration: nonEmptyString(100),

  difficulty: z.enum(["Easy", "Medium", "Hard"]),

  description: nonEmptyString(1000),

  whyItMatters: nonEmptyString(500),

  prerequisites: z.array(nonEmptyString(200)).default([]),

  learningOutcomes: z.array(nonEmptyString(300)).min(1).max(10),

  resources: z.array(resourceSchema).max(4).default([]),
});

export const generateRoadmapSchema = z
  .object({
    role: nonEmptyString(150),

    targetPackage: nonEmptyString(100),

    useResume: z.boolean().default(false),

    resume: z.string().trim().max(30000).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.useResume && !data.resume) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["resume"],
        message: "Resume is required when useResume is true.",
      });
    }
  });

export const roadmapSchema = z
  .object({
    title: nonEmptyString(200),

    level: z.enum(["Beginner", "Intermediate", "Advanced"]),

    duration: nonEmptyString(100),

    modules: z.array(moduleSchema).min(1).max(20),
  })
  .superRefine((roadmap, ctx) => {
    const orders = roadmap.modules.map((module) => module.order);

    const uniqueOrders = new Set(orders);

    if (uniqueOrders.size !== orders.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["modules"],
        message: "Module order values must be unique.",
      });
    }

    const sortedOrders = [...orders].sort((a, b) => a - b);

    const isSequential = sortedOrders.every(
      (order, index) => order === index + 1,
    );

    if (!isSequential) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["modules"],
        message: "Module order must be sequential starting from 1.",
      });
    }

    const primaryResourceCount = roadmap.modules.map(
      (module) =>
        module.resources.filter((resource) => resource.isPrimary).length,
    );

    primaryResourceCount.forEach((count, index) => {
      if (count > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["modules", index, "resources"],
          message: "A module can have only one primary resource.",
        });
      }
    });
  });

export const roadmapIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid roadmap ID."),
});

export const updateProgressSchema = z.object({
  moduleOrder: z.number().int().min(1),

  completed: z.boolean(),
});
