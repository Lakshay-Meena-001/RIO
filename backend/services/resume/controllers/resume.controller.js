import crypto from "node:crypto";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import { resumeAgent } from "../agents/resume.agent.js";
import extractText from "../config/pdf.js";
import Resume from "../models/resume.model.js";
import redis from "../../../shared/redis/redis.js";
import { z } from "zod";

const RESUME_SCORER_PRICE = 100;
const CACHE_TTL_SECONDS = 60 * 60;
const ANALYSIS_LOCK_MS = 120000;
const BILLING_LOCK_MS = 30000;
const RESUME_SCORER_ACTION = "resume-scorer";

const optionalText = (max = 10000) => z.string().max(max).optional();
const optionalTextList = (maxItems = 100, maxText = 500) =>
  z.array(z.string().max(maxText)).max(maxItems).optional();

const resumeUpdateSchema = z.object({
  resumeId: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
  profile: z
    .object({
      name: optionalText(200),
      email: optionalText(320),
      phone: optionalText(100),
      location: optionalText(300),
      linkedIn: optionalText(1000),
      github: optionalText(1000),
      portfolio: optionalText(1000),
      leetcode: optionalText(1000),
    })
    .strict()
    .optional(),
  summary: optionalText(10000),
  education: z
    .array(
      z
        .object({
          institution: optionalText(500),
          degree: optionalText(300),
          field: optionalText(300),
          startDate: optionalText(100),
          endDate: optionalText(100),
          description: optionalText(5000),
        })
        .strict(),
    )
    .max(50)
    .optional(),
  experience: z
    .array(
      z
        .object({
          company: optionalText(500),
          role: optionalText(300),
          location: optionalText(300),
          startDate: optionalText(100),
          endDate: optionalText(100),
          description: optionalText(10000),
          technologies: optionalTextList(100, 100),
        })
        .strict(),
    )
    .max(100)
    .optional(),
  projects: z
    .array(
      z
        .object({
          title: optionalText(500),
          description: optionalText(10000),
          technologies: optionalTextList(100, 100),
          url: optionalText(1000),
          githubUrl: optionalText(1000),
          startDate: optionalText(100),
          endDate: optionalText(100),
        })
        .strict(),
    )
    .max(100)
    .optional(),
  skills: optionalTextList(200, 150),
  certifications: optionalTextList(100, 500),
  achievements: optionalTextList(100, 1000),
  languages: optionalTextList(50, 150),
});

const getBillingTransactionId = (userId, fingerprint) =>
  `resume-scorer:${userId}:${fingerprint}`;

const deductResumeScorerBalance = async (userId, fingerprint) => {
  const authServiceUrl =
    process.env.AUTH_SERVICE_URL?.trim() || "http://localhost:8001";
  const internalSecret = process.env.AUTH_INTERNAL_SECRET?.trim();

  if (!internalSecret) {
    const error = new Error(
      "AUTH_INTERNAL_SECRET is missing in Resume service.",
    );
    error.status = 503;
    throw error;
  }

  const transactionId = getBillingTransactionId(userId, fingerprint);
  let response;

  try {
    response = await fetch(
      `${authServiceUrl.replace(/\/+$/, "")}/internal/deduct-resume-scorer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
          "x-internal-service-secret": internalSecret,
        },
        body: JSON.stringify({
          amount: RESUME_SCORER_PRICE,
          action: RESUME_SCORER_ACTION,
          transactionId,
        }),
        signal: AbortSignal.timeout(15000),
      },
    );
  } catch (cause) {
    const error = new Error("Resume Scorer billing service is unavailable.", {
      cause,
    });
    error.status = 503;
    throw error;
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success !== true) {
    const error = new Error(result.message || "Resume Scorer billing failed.");
    error.status =
      response.status >= 400 && response.status < 500 ? response.status : 503;
    throw error;
  }

  return { ...result, transactionId };
};

const resumeCacheKey = (userId, resumeId) => `resume:${userId}:${resumeId}`;
const legacyResumeCacheKey = (userId) => `resume:${userId}`;

const isValidObjectId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

const getUserId = (req) => {
  const value = req.internalUserId;
  return typeof value === "string" && isValidObjectId(value) ? value : null;
};

const normalizeResumeText = (value = "") =>
  String(value)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const getContentFingerprint = (text) =>
  crypto
    .createHash("sha256")
    .update(String(text).replace(/\s+/g, " ").trim())
    .digest("hex");

const logError = (operation, error) => {
  console.error(`[Resume] ${operation}:`, {
    message: error?.message,
    code: error?.code,
    status: error?.status,
  });
};

const safeCacheGet = async (key) => {
  try {
    return await redis.get(key);
  } catch (error) {
    logError("Redis read failed", error);
    return null;
  }
};

const safeCacheSet = async (key, value) => {
  try {
    await redis.set(key, value, "EX", CACHE_TTL_SECONDS);
  } catch (error) {
    logError("Redis write failed", error);
  }
};

const safeCacheDelete = async (...keys) => {
  try {
    if (keys.length) await redis.del(...keys);
  } catch (error) {
    logError("Redis invalidation failed", error);
  }
};

const cacheResume = async (userId, resume) => {
  const value = JSON.stringify(resume);
  const resumeId = String(resume._id);

  await Promise.all([
    safeCacheSet(legacyResumeCacheKey(userId), value),
    safeCacheSet(resumeCacheKey(userId, resumeId), value),
  ]);
};

const deleteTempFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT")
      logError("Temporary file cleanup failed", error);
  }
};

const sendServerError = (res, operation) =>
  res.status(500).json({
    success: false,
    message: `Failed to ${operation}. Please try again.`,
  });

const visibleResumeCondition = {
  $or: [
    { idempotencyKey: { $exists: false } },
    { idempotencyKey: null },
    { "billing.status": "charged", "processing.status": "completed" },
  ],
};

const getVisibleResumeFilter = (userId, extra = {}) => ({
  ...extra,
  userId,
  ...visibleResumeCondition,
});

// Scorer history must only expose reports produced by the paid PDF-analysis
// workflow. Builder-created resumes have no extracted PDF text and do not have
// completed processing/billing metadata, so they can never qualify here.
const getScoredResumeFilter = (userId, extra = {}) => ({
  ...getVisibleResumeFilter(userId, extra),
  extractedText: { $type: "string", $ne: "" },
  "processing.status": "completed",
  "processing.stage": "completed",
  "processing.analyzedAt": { $ne: null },
  "billing.status": "charged",
});

// Builder history/detail/update are restricted to manually authored records.
// A scored PDF report remains in the Scorer domain unless the user explicitly
// imports its content into a new Builder record.
const getBuilderResumeFilter = (userId, extra = {}) => ({
  ...getVisibleResumeFilter(userId, extra),
  extractedText: { $in: ["", null] },
  "billing.status": { $ne: "charged" },
  idempotencyKey: { $exists: false },
});

const getBalanceDeductionSummary = (billingResult) => {
  if (!billingResult || billingResult.alreadyProcessed === true) return null;

  return {
    service: "Resume Scorer",
    previousBalance: billingResult.previousBalance,
    deductedAmount: billingResult.deductedAmount,
    balance: billingResult.balance,
  };
};

const claimResumeLock = async (userId, resume, stage, lockDurationMs) => {
  const lockToken = randomUUID();
  const now = new Date();
  const claimedResume = await Resume.findOneAndUpdate(
    {
      _id: resume._id,
      userId,
      idempotencyKey: resume.idempotencyKey,
      "billing.status": { $ne: "charged" },
      $or: [
        { "processing.lockExpiresAt": { $exists: false } },
        { "processing.lockExpiresAt": null },
        { "processing.lockExpiresAt": { $lte: now } },
      ],
    },
    {
      $set: {
        "processing.status": "processing",
        "processing.stage": stage,
        "processing.lockToken": lockToken,
        "processing.lockExpiresAt": new Date(now.getTime() + lockDurationMs),
      },
    },
    { new: true },
  ).select("+idempotencyKey +processing.lockToken +processing.lockExpiresAt");

  if (!claimedResume) {
    const latest = await Resume.findById(resume._id).select("+idempotencyKey");
    if (
      latest?.billing?.status === "charged" &&
      latest?.processing?.status === "completed"
    ) {
      return { resume: latest, lockToken: null, alreadyCompleted: true };
    }

    const error = new Error(
      "Resume processing is already in progress. Retry shortly.",
    );
    error.status = 503;
    throw error;
  }

  return { resume: claimedResume, lockToken, alreadyCompleted: false };
};

const analyzeReservedResume = async (userId, resume, lockToken) => {
  let analyzedResume;

  try {
    analyzedResume = await resumeAgent(resume.extractedText);
  } catch (cause) {
    await Resume.updateOne(
      {
        _id: resume._id,
        userId,
        idempotencyKey: resume.idempotencyKey,
        "processing.lockToken": lockToken,
        "billing.status": { $ne: "charged" },
      },
      {
        $set: {
          "processing.status": "failed",
          "processing.stage": "analysis_failed",
          "processing.error":
            "Resume analysis could not be completed. Retry the upload.",
        },
        $unset: {
          "processing.lockToken": 1,
          "processing.lockExpiresAt": 1,
        },
      },
    );

    const error = new Error("Resume analysis provider failed.", { cause });
    error.status = 503;
    throw error;
  }

  const preparedResume = await Resume.findOneAndUpdate(
    {
      _id: resume._id,
      userId,
      idempotencyKey: resume.idempotencyKey,
      "processing.lockToken": lockToken,
      "billing.status": { $ne: "charged" },
    },
    {
      $set: {
        ...analyzedResume,
        "processing.status": "pending",
        "processing.stage": "billing",
        "processing.parser": "pdf-parse",
        "processing.analyzedAt": new Date(),
        "processing.error": "",
      },
      $unset: {
        "processing.lockToken": 1,
        "processing.lockExpiresAt": 1,
      },
    },
    { new: true, runValidators: true },
  ).select("+idempotencyKey");

  if (!preparedResume) {
    const error = new Error("Resume analysis could not be saved safely.");
    error.status = 503;
    throw error;
  }

  return preparedResume;
};

const finalizePendingResume = async (userId, resume) => {
  if (!resume.idempotencyKey) {
    // Legacy records were created before this idempotent workflow existed.
    // Never charge them again merely because their old billing field is pending.
    return { resume, billingResult: null };
  }

  if (
    resume.billing?.status === "charged" &&
    resume.processing?.status === "completed"
  ) {
    return { resume, billingResult: null };
  }

  const claim = await claimResumeLock(
    userId,
    resume,
    "billing",
    BILLING_LOCK_MS,
  );
  if (claim.alreadyCompleted) {
    return { resume: claim.resume, billingResult: null };
  }

  let billingResult;
  try {
    billingResult = await deductResumeScorerBalance(
      userId,
      claim.resume.contentFingerprint,
    );
  } catch (error) {
    const definiteRejection = error.status === 400;
    await Resume.updateOne(
      {
        _id: claim.resume._id,
        userId,
        idempotencyKey: claim.resume.idempotencyKey,
        "processing.lockToken": claim.lockToken,
        "billing.status": { $ne: "charged" },
      },
      {
        $set: {
          "billing.status": definiteRejection ? "failed" : "pending",
          "processing.status": definiteRejection ? "failed" : "pending",
          "processing.stage": definiteRejection ? "billing_failed" : "billing",
          "processing.error": definiteRejection
            ? "Billing was rejected; resolve the billing issue and retry."
            : "Billing result was not confirmed; retry to reconcile safely.",
        },
        $unset: {
          "processing.lockToken": 1,
          "processing.lockExpiresAt": 1,
        },
      },
    );
    await safeCacheDelete(
      legacyResumeCacheKey(userId),
      resumeCacheKey(userId, String(resume._id)),
    );

    if (definiteRejection) throw error;
    error.status = 503;
    throw error;
  }

  try {
    const completedResume = await Resume.findOneAndUpdate(
      {
        _id: claim.resume._id,
        userId,
        idempotencyKey: claim.resume.idempotencyKey,
        "processing.lockToken": claim.lockToken,
      },
      {
        $set: {
          "billing.status": "charged",
          "billing.transactionId": billingResult.transactionId,
          "billing.amount": RESUME_SCORER_PRICE,
          "billing.chargedAt": new Date(),
          "processing.status": "completed",
          "processing.stage": "completed",
          "processing.analyzedAt": new Date(),
          "processing.error": "",
        },
        $unset: {
          "processing.lockToken": 1,
          "processing.lockExpiresAt": 1,
        },
      },
      { new: true, runValidators: true },
    ).select("+idempotencyKey");

    if (!completedResume) {
      const error = new Error(
        "Resume processing record could not be finalized.",
      );
      error.status = 503;
      throw error;
    }

    await cacheResume(userId, completedResume);
    return { resume: completedResume, billingResult };
  } catch (cause) {
    const error = new Error(
      "Billing was confirmed, but the resume could not be finalized. Retry the same upload to reconcile it.",
      { cause },
    );
    error.status = 503;
    throw error;
  }
};

const processExistingResume = async (userId, resume) => {
  if (!resume.idempotencyKey) {
    return { resume, billingResult: null };
  }

  if (
    resume.billing?.status === "charged" &&
    resume.processing?.status === "completed"
  ) {
    return { resume, billingResult: null };
  }

  if (["billing", "billing_failed"].includes(resume.processing?.stage)) {
    return finalizePendingResume(userId, resume);
  }

  const claim = await claimResumeLock(
    userId,
    resume,
    "analyzing",
    ANALYSIS_LOCK_MS,
  );
  if (claim.alreadyCompleted) {
    return { resume: claim.resume, billingResult: null };
  }

  const preparedResume = await analyzeReservedResume(
    userId,
    claim.resume,
    claim.lockToken,
  );
  return finalizePendingResume(userId, preparedResume);
};

const respondWithResume = (
  res,
  { resume, reused, billingResult, status = 200 },
) =>
  res.status(status).json({
    success: true,
    reused,
    message: reused
      ? "This resume already exists. Existing analysis reused."
      : "Resume analyzed and saved successfully",
    data: resume,
    balanceDeduction: getBalanceDeductionSummary(billingResult),
  });

const getExistingResume = async (userId, contentFingerprint) =>
  Resume.findOne({ userId, contentFingerprint })
    .select("+idempotencyKey +processing.lockToken +processing.lockExpiresAt")
    .sort({ idempotencyKey: -1, updatedAt: -1 });

// POST /api/resumes/upload
export const uploadResume = async (req, res) => {
  const filePath = req.file?.path;

  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user identity is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume PDF is required",
      });
    }

    const extractedText = await extractText(filePath);
    const normalizedText = normalizeResumeText(extractedText);
    const maxTextLength = Number(process.env.RESUME_MAX_TEXT_LENGTH ?? 50000);

    if (!normalizedText) {
      return res.status(400).json({
        success: false,
        message: "Could not extract readable text from the resume PDF",
      });
    }

    if (
      !Number.isInteger(maxTextLength) ||
      maxTextLength <= 0 ||
      normalizedText.length > maxTextLength
    ) {
      return res.status(400).json({
        success: false,
        message: "Resume text is empty or exceeds the allowed length",
      });
    }

    const contentFingerprint = getContentFingerprint(normalizedText);
    const existingResume = await getExistingResume(userId, contentFingerprint);

    if (existingResume) {
      const result = await processExistingResume(userId, existingResume);
      return respondWithResume(res, {
        ...result,
        reused: true,
        status: 200,
      });
    }

    // Reserve this user/content pair before the LLM call. A unique sparse index
    // plus a short-lived MongoDB lease prevents concurrent uploads from running
    // duplicate LLM analysis or creating duplicate reports.
    const idempotencyKey = `${userId}:${contentFingerprint}`;
    const analysisLockToken = randomUUID();
    const now = new Date();
    let resume;

    try {
      resume = await Resume.create({
        userId,
        extractedText: normalizedText,
        contentFingerprint,
        idempotencyKey,
        processing: {
          status: "processing",
          stage: "analyzing",
          parser: "pdf-parse",
          analyzedAt: null,
          error: "",
          lockToken: analysisLockToken,
          lockExpiresAt: new Date(now.getTime() + ANALYSIS_LOCK_MS),
        },
        billing: {
          status: "pending",
          transactionId: getBillingTransactionId(userId, contentFingerprint),
          amount: RESUME_SCORER_PRICE,
          chargedAt: null,
        },
      });
    } catch (error) {
      if (error?.code !== 11000) throw error;

      const racedResume = await getExistingResume(userId, contentFingerprint);
      if (!racedResume) throw error;
      const result = await processExistingResume(userId, racedResume);
      return respondWithResume(res, {
        ...result,
        reused: true,
        status: 200,
      });
    }

    const preparedResume = await analyzeReservedResume(
      userId,
      resume,
      analysisLockToken,
    );
    const result = await finalizePendingResume(userId, preparedResume);
    return respondWithResume(res, {
      ...result,
      reused: false,
      status: 201,
    });
  } catch (error) {
    logError("Upload failed", error);
    const clientInputCodes = new Set([
      "PDF_EMPTY",
      "INVALID_PDF",
      "PDF_NO_READABLE_TEXT",
      "PDF_EXTRACTION_FAILED",
      "RESUME_TEXT_TOO_LONG",
    ]);
    const status = Number.isInteger(error?.status)
      ? error.status
      : error?.code === "PDF_TOO_LARGE"
        ? 413
        : clientInputCodes.has(error?.code)
          ? 400
          : 500;

    return res.status(status).json({
      success: false,
      code:
        error?.code ||
        (status === 503
          ? "RESUME_TEMPORARILY_UNAVAILABLE"
          : "RESUME_ANALYSIS_FAILED"),
      message:
        status === 400 || status === 409
          ? error.message
          : status === 413
            ? "The uploaded PDF exceeds the allowed size."
            : status === 503
              ? "Resume analysis or billing is temporarily unavailable. Retry the same upload safely."
              : "Failed to analyze the resume. Please try again.",
    });
  } finally {
    await deleteTempFile(filePath);
  }
};

// GET /api/resumes/get-resume: backward-compatible latest-resume endpoint.
export const getResume = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user identity is required",
      });
    }

    const cacheKey = legacyResumeCacheKey(userId);
    const cached = await safeCacheGet(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (
          String(parsed?.userId) === userId &&
          isValidObjectId(String(parsed?._id)) &&
          !String(parsed?.extractedText || "").trim() &&
          parsed?.billing?.status !== "charged"
        ) {
          return res
            .status(200)
            .json({ success: true, source: "redis", data: parsed });
        }
      } catch {
        // Invalid cache data falls through to MongoDB.
      }
      await safeCacheDelete(cacheKey);
    }

    const resume = await Resume.findOne(getBuilderResumeFilter(userId)).sort({
      updatedAt: -1,
    });

    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }

    await cacheResume(userId, resume);
    return res
      .status(200)
      .json({ success: true, source: "mongodb", data: resume });
  } catch (error) {
    logError("Get latest resume failed", error);
    return sendServerError(res, "fetch the resume");
  }
};

// GET /api/resumes/
export const listResumes = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user identity is required",
      });
    }

    const resumes = await Resume.find(getBuilderResumeFilter(userId))
      .select(
        "_id profile.name profile.email createdAt updatedAt processing.status",
      )
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({ success: true, data: resumes });
  } catch (error) {
    logError("List resumes failed", error);
    return sendServerError(res, "list resumes");
  }
};

// GET /api/resumes/scored: only successfully analyzed and billed reports.
export const listScoredResumes = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user identity is required",
      });
    }

    const resumes = await Resume.find(getScoredResumeFilter(userId))
      .select(
        "_id profile summary education experience projects skills certifications achievements languages analysis processing.status processing.stage processing.analyzedAt billing.status billing.amount billing.chargedAt createdAt updatedAt",
      )
      .sort({ "processing.analyzedAt": -1, createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({ success: true, data: resumes });
  } catch (error) {
    logError("List scored resumes failed", error);
    return sendServerError(res, "list scored resumes");
  }
};

// GET /api/resumes/scored/:resumeId: prevents a manually created builder resume
// from being opened as a Scorer report by guessing/passing its ID in the URL.
export const getScoredResumeById = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { resumeId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user identity is required",
      });
    }
    if (!isValidObjectId(resumeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid resume ID" });
    }

    const resume = await Resume.findOne(
      getScoredResumeFilter(userId, { _id: resumeId }),
    ).select("-extractedText -contentFingerprint -idempotencyKey");

    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Scored resume report not found" });
    }

    return res.status(200).json({ success: true, data: resume });
  } catch (error) {
    logError("Get scored resume by ID failed", error);
    return sendServerError(res, "fetch the scored resume report");
  }
};

// GET /api/resumes/:resumeId
export const getResumeById = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { resumeId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user identity is required",
      });
    }
    if (!isValidObjectId(resumeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid resume ID" });
    }

    const cacheKey = resumeCacheKey(userId, resumeId);
    const cached = await safeCacheGet(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (
          String(parsed?._id) === resumeId &&
          String(parsed?.userId) === userId &&
          !String(parsed?.extractedText || "").trim() &&
          parsed?.billing?.status !== "charged"
        ) {
          return res
            .status(200)
            .json({ success: true, source: "redis", data: parsed });
        }
      } catch {
        // Invalid cache data falls through to MongoDB.
      }
      await safeCacheDelete(cacheKey);
    }

    const resume = await Resume.findOne(
      getBuilderResumeFilter(userId, { _id: resumeId }),
    );

    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }

    await safeCacheSet(cacheKey, JSON.stringify(resume));
    return res
      .status(200)
      .json({ success: true, source: "mongodb", data: resume });
  } catch (error) {
    logError("Get resume by ID failed", error);
    return sendServerError(res, "fetch the resume");
  }
};

const validateResumeContent = (data) => {
  const profile = data?.profile || {};
  const errors = [];
  if (!String(profile.name || "").trim()) errors.push("Full name is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(profile.email || "").trim()))
    errors.push("A valid email address is required.");
  if (String(profile.phone || "").replace(/\D/g, "").length < 7)
    errors.push("A valid phone number is required.");
  if (String(data?.summary || "").trim().length < 30)
    errors.push("Professional summary must contain at least 30 characters.");
  const education = Array.isArray(data?.education) ? data.education : [];
  if (
    !education.some(
      (item) =>
        String(item?.institution || "").trim() &&
        String(item?.degree || "").trim(),
    )
  )
    errors.push(
      "Add at least one education entry with institution and degree.",
    );
  const skills = Array.isArray(data?.skills)
    ? data.skills.filter((item) => String(item || "").trim())
    : [];
  if (skills.length < 3) errors.push("Add at least 3 skills.");
  const projects = Array.isArray(data?.projects) ? data.projects : [];
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const hasProject = projects.some(
    (item) =>
      String(item?.title || "").trim() &&
      String(item?.description || "").trim(),
  );
  const hasExperience = experience.some(
    (item) =>
      String(item?.company || "").trim() &&
      String(item?.role || "").trim() &&
      String(item?.description || "").trim(),
  );
  if (!hasProject && !hasExperience)
    errors.push("Add at least one complete project or work experience entry.");

  const hasEntryContent = (item) =>
    Object.values(item || {}).some((value) =>
      Array.isArray(value)
        ? value.some((entry) => String(entry || "").trim())
        : String(value || "").trim(),
    );
  if (
    education.some(
      (item) =>
        hasEntryContent(item) &&
        !(
          String(item?.institution || "").trim() &&
          String(item?.degree || "").trim()
        ),
    )
  )
    errors.push(
      "Complete institution and degree for every education entry you started, or remove incomplete entries.",
    );
  if (
    projects.some(
      (item) =>
        hasEntryContent(item) &&
        !(
          String(item?.title || "").trim() &&
          String(item?.description || "").trim()
        ),
    )
  )
    errors.push(
      "Complete title and description for every project you started, or remove incomplete projects.",
    );
  if (
    experience.some(
      (item) =>
        hasEntryContent(item) &&
        !(
          String(item?.company || "").trim() &&
          String(item?.role || "").trim() &&
          String(item?.description || "").trim()
        ),
    )
  )
    errors.push(
      "Complete company, role and description for every work entry you started, or remove incomplete entries.",
    );
  return errors;
};

export const createResume = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Authenticated user identity is required",
      });

    const parsedBody = resumeUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: "Resume contains invalid or unsupported fields.",
      });
    }
    const data = parsedBody.data;
    const validationErrors = validateResumeContent(data);
    if (validationErrors.length) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(" "),
        errors: validationErrors,
      });
    }

    const resume = await Resume.create({
      userId,
      profile: data.profile,
      summary: data.summary,
      education: data.education || [],
      experience: data.experience || [],
      projects: data.projects || [],
      skills: data.skills || [],
      certifications: data.certifications || [],
      achievements: data.achievements || [],
      languages: data.languages || [],
      isArchived: false,
      deletedAt: null,
    });
    await safeCacheDelete(legacyResumeCacheKey(userId));
    await cacheResume(userId, resume);
    return res.status(201).json({
      success: true,
      message: "Resume created successfully",
      data: resume,
    });
  } catch (error) {
    logError("Create resume failed", error);
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Resume contains invalid field values.",
      });
    }
    return sendServerError(res, "create the resume");
  }
};

// PATCH /api/resumes/update; updates only the explicitly selected resume.
export const updateResume = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user identity is required",
      });
    }

    const parsedBody = resumeUpdateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: "Resume update contains invalid or unsupported fields.",
      });
    }

    const {
      resumeId,
      profile,
      summary,
      education,
      experience,
      projects,
      skills,
      certifications,
      achievements,
      languages,
    } = parsedBody.data;

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: "Resume ID is required to update an existing resume.",
      });
    }
    const validationErrors = validateResumeContent(parsedBody.data);
    if (validationErrors.length) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(" "),
        errors: validationErrors,
      });
    }

    const editableFields = {
      profile,
      summary,
      education,
      experience,
      projects,
      skills,
      certifications,
      achievements,
      languages,
    };
    const updateData = Object.fromEntries(
      Object.entries(editableFields).filter(([, value]) => value !== undefined),
    );

    if (!Object.keys(updateData).length) {
      return res.status(400).json({
        success: false,
        message: "No editable resume fields were provided",
      });
    }

    const filter = getBuilderResumeFilter(userId, { _id: resumeId });
    const resume = await Resume.findOneAndUpdate(
      filter,
      { $set: updateData },
      { new: true, runValidators: true, sort: { updatedAt: -1 } },
    ).select("+idempotencyKey");

    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }

    await safeCacheDelete(
      legacyResumeCacheKey(userId),
      resumeCacheKey(userId, String(resume._id)),
    );
    await cacheResume(userId, resume);

    return res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      data: resume,
    });
  } catch (error) {
    logError("Update resume failed", error);
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Resume update contains invalid field values",
      });
    }
    return sendServerError(res, "update the resume");
  }
};

// DELETE /api/resumes/scored/:resumeId. Only a completed, charged PDF analysis
// may be deleted through the Scorer workflow.
export const deleteScoredResume = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { resumeId } = req.params;
    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Authenticated user identity is required",
      });
    if (!isValidObjectId(resumeId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid resume ID" });

    const filter = getScoredResumeFilter(userId, { _id: resumeId });
    const report = await Resume.findOneAndDelete(filter);
    if (!report)
      return res
        .status(404)
        .json({ success: false, message: "Scored resume report not found" });

    await safeCacheDelete(
      resumeCacheKey(userId, resumeId),
      legacyResumeCacheKey(userId),
    );
    return res.status(200).json({
      success: true,
      message: "Scored resume report deleted successfully",
    });
  } catch (error) {
    logError("Delete scored resume report failed", error);
    return sendServerError(res, "delete the scored resume report");
  }
};

export const deleteResume = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { resumeId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user identity is required",
      });
    }
    if (!isValidObjectId(resumeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid resume ID" });
    }

    // Builder deletion must never target a paid Scorer report. Scored uploads
    // have extracted PDF text and charged billing metadata; those use the
    // dedicated /scored/:resumeId endpoint instead.
    const builderOnlyFilter = {
      _id: resumeId,
      userId,
      // Accept both legacy Builder documents where the optional field is
      // absent and documents where it was explicitly stored as null.
      $and: [
        {
          $or: [
            { idempotencyKey: { $exists: false } },
            { idempotencyKey: null },
          ],
        },
        {
          $or: [
            { extractedText: { $exists: false } },
            { extractedText: "" },
            { extractedText: null },
          ],
        },
        {
          $or: [
            { "billing.status": { $exists: false } },
            { "billing.status": { $ne: "charged" } },
          ],
        },
      ],
    };
    const existing = await Resume.findOne(builderOnlyFilter).select(
      "+idempotencyKey billing.status processing.status +processing.lockExpiresAt",
    );

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }

    const canDeleteFailedRecord =
      existing.idempotencyKey &&
      existing.billing?.status === "failed" &&
      existing.processing?.status === "failed";

    if (
      existing.idempotencyKey &&
      existing.billing?.status !== "charged" &&
      !canDeleteFailedRecord
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Resume analysis is still being finalized. Retry deletion shortly.",
      });
    }

    const deleteFilter = {
      ...builderOnlyFilter,
      ...(canDeleteFailedRecord
        ? {
            "billing.status": "failed",
            "processing.status": "failed",
            $or: [
              { "processing.lockExpiresAt": { $exists: false } },
              { "processing.lockExpiresAt": { $lte: new Date() } },
            ],
          }
        : {}),
    };
    const deletedResume = await Resume.findOneAndDelete(deleteFilter);
    if (!deletedResume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }

    await safeCacheDelete(
      resumeCacheKey(userId, resumeId),
      legacyResumeCacheKey(userId),
    );

    return res
      .status(200)
      .json({ success: true, message: "Resume deleted successfully" });
  } catch (error) {
    logError("Delete resume failed", error);
    return sendServerError(res, "delete resume");
  }
};
