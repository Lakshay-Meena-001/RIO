import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Common Schemas
|--------------------------------------------------------------------------
*/

const difficultySchema = z.enum(["easy", "medium", "hard", "adaptive"]);

const interviewLevelSchema = z.enum(["fresher", "sde-1", "sde-2"]);

const experienceLevelSchema = z.enum(["fresher", "experienced"]);

const interviewTypeSchema = z.enum([
  "dsa",
  "core",
  "development",
  "project",
  "system-design",
  "behavioral",
  "full",
]);

const coreSubjectSchema = z.enum(["dbms", "os", "cn", "sql", "oop"]);

const questionSectionSchema = z.enum([
  "dsa",
  "dbms",
  "os",
  "cn",
  "sql",
  "oop",
  "development",
  "project",
  "system-design",
  "behavioral",
]);

/*
|--------------------------------------------------------------------------
| Project Context
|--------------------------------------------------------------------------
*/

export const projectContextSchema = z.object({
  source: z.enum(["resume", "github", "description"]).nullable().default(null),

  projectName: z.string().trim().default(""),

  description: z.string().default(""),

  githubUrl: z.string().trim().default(""),
});

/*
|--------------------------------------------------------------------------
| Start Interview Request
|--------------------------------------------------------------------------
*/

export const startInterviewSchema = z.object({
  role: z.string().trim().min(1, "Role is required"),

  experienceLevel: experienceLevelSchema,

  interviewLevel: interviewLevelSchema,

  interviewType: interviewTypeSchema,

  subjects: z.array(coreSubjectSchema).default([]),

  language: z.literal("english").default("english"),

  difficulty: difficultySchema.default("easy"),

  timeLimit: z.number().int().min(1).default(30),

  questionCount: z.number().int().min(1).default(10),

  techStack: z.array(z.string().trim().min(1)).default([]),

  projectContext: projectContextSchema.nullable().default(null),
});

/*
|--------------------------------------------------------------------------
| Submit Answer Request
|--------------------------------------------------------------------------
*/

export const submitAnswerSchema = z.object({
  interviewId: z.string().min(1, "Interview ID is required"),

  answer: z.string().trim().min(1, "Answer is required"),
});

/*
|--------------------------------------------------------------------------
| Interview Question
|--------------------------------------------------------------------------
*/

export const interviewQuestionSchema = z.object({
  questionId: z.string().min(1),

  text: z.string().min(1),

  section: questionSectionSchema,

  type: z.enum(["primary"]).default("primary"),

  difficulty: z.enum(["easy", "medium", "hard"]),

});

/*
|--------------------------------------------------------------------------
| Feedback / Evaluation
|--------------------------------------------------------------------------
*/

export const feedbackSchema = z.object({
  score: z.number().min(0).max(10),

  correctness: z.number().min(0).max(10),

  clarity: z.number().min(0).max(10),

  relevance: z.number().min(0).max(10),

  communication: z.number().min(0).max(10),

  feedback: z.string(),

  strengths: z.array(z.string()),

  weaknesses: z.array(z.string()),

  betterAnswer: z.string(),

  recommendations: z.array(z.string()),
});


/*
|--------------------------------------------------------------------------
| Final Interview Summary
|--------------------------------------------------------------------------
*/

export const summarySchema = z.object({
  overallScore: z.number().min(0).max(10),

  sectionScores: z.record(z.string(), z.number().min(0).max(10)),

  strengths: z.array(z.string()),

  weaknesses: z.array(z.string()),

  recommendations: z.array(z.string()).length(5),

  summary: z.string(),
});


/*
|--------------------------------------------------------------------------
| Add more questions
|--------------------------------------------------------------------------
*/

export const addMoreQuestionsSchema = z.object({
  count: z.number().int().min(1).max(20).default(5),
});
