import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Common Schemas
|--------------------------------------------------------------------------
*/

const difficultySchema = z.enum(["easy", "medium", "hard", "adaptive"]);

const interviewLevelSchema = z.enum(["fresher", "sde-1", "sde-2"]);

const experienceLevelSchema = z.enum(["fresher", "experienced"]);

/*
 * DSA has been completely replaced by Coding.
 */
const interviewTypeSchema = z.enum([
  "coding",
  "core",
  "development",
  "project",
  "system-design",
  "behavioral",
  "full",
]);

const coreSubjectSchema = z.enum(["dbms", "os", "cn", "sql", "oop"]);

const codingLanguageSchema = z.enum([
  "cpp",
  "python",
  "javascript",
  "typescript",
  "java",
]);

const questionSectionSchema = z.enum([
  "coding",
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

  projectName: z.string().trim().max(150).default(""),

  description: z.string().trim().max(5000).default(""),

  githubUrl: z.string().trim().max(500).default(""),
});

/*
|--------------------------------------------------------------------------
| Start Interview Request
|--------------------------------------------------------------------------
*/

export const startInterviewSchema = z.object({
  role: z.string().trim().min(1, "Role is required").max(120),

  experienceLevel: experienceLevelSchema,

  interviewLevel: interviewLevelSchema,

  interviewType: interviewTypeSchema,

  interviewMode: z.enum(["standard", "agent"]).default("standard"),

  subjects: z.array(coreSubjectSchema).max(5).default([]),

  language: z.literal("english").default("english"),

  /*
   * Programming language used by the candidate for Coding interviews.
   *
   * For non-coding interviews this may be omitted.
   */
  codingLanguage: codingLanguageSchema.nullable().default(null),

  difficulty: difficultySchema.default("easy"),

  timeLimit: z.number().int().min(1).max(180).default(30),

  questionCount: z.number().int().min(1).max(50).default(10),

  techStack: z.array(z.string().trim().min(1).max(80)).max(20).default([]),

  projectContext: projectContextSchema.nullable().default(null),
});

/*
|--------------------------------------------------------------------------
| Interview Question
|--------------------------------------------------------------------------
*/

export const interviewQuestionSchema = z.object({
  questionId: z.string().trim().min(1),

  /*
   * Coding problem title.
   *
   * Empty/not required for non-coding questions.
   */
  title: z.string().trim().max(200).default(""),

  text: z.string().trim().min(1).max(5000),

  section: questionSectionSchema,

  type: z.enum(["primary"]).default("primary"),

  difficulty: z.enum(["easy", "medium", "hard"]),

  /*
   * Coding problem constraints.
   */
  constraints: z.array(z.string().max(500)).max(20).default([]),

  /*
   * Coding problem examples.
   */
  examples: z
    .array(
      z.object({
        input: z.string().max(1500).default(""),
        output: z.string().max(1500).default(""),
        explanation: z.string().max(1500).default(""),
      }),
    )
    .max(5)
    .default([]),
  starterCode: z.string().max(20000).default(""),
});

/*
|--------------------------------------------------------------------------
| Complete Interview Question Set
|--------------------------------------------------------------------------
|
| The interview agent generates the complete question set
| at interview start.
|
*/

export const interviewQuestionsSchema = z.object({
  questions: z.array(interviewQuestionSchema).min(1),
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

  /*
   * Coding-specific evaluation dimensions.
   */
  logic: z.number().min(0).max(10),

  complexity: z.number().min(0).max(10),

  edgeCases: z.number().min(0).max(10),

  codeQuality: z.number().min(0).max(10),

  feedback: z.string().max(4000),

  strengths: z.array(z.string().max(300)).max(5),

  weaknesses: z.array(z.string().max(300)).max(5),

  betterAnswer: z.string().max(4000),

  recommendations: z.array(z.string().max(300)).max(5),
});

/*
|--------------------------------------------------------------------------
| Final Interview Summary
|--------------------------------------------------------------------------
*/

export const summarySchema = z.object({
  overallScore: z.number().min(0).max(10),

  sectionScores: z.record(z.string(), z.number().min(0).max(10)),

  strengths: z.array(z.string().max(300)).max(5),

  weaknesses: z.array(z.string().max(300)).max(5),

  recommendations: z.array(z.string().max(300)).length(5),

  summary: z.string().max(2000),
});
