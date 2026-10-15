import crypto from "node:crypto";
import fs from "node:fs/promises";
import { resumeAgent } from "../agents/resume.agent.js";
import extractText from "../config/pdf.js";
import Resume from "../models/resume.model.js";
import redis from "../../../shared/redis/redis.js";

const RESUME_SCORER_PRICE = 100;

const deductResumeScorerBalance = async (userId, fingerprint) => {
  const authServiceUrl = process.env.AUTH_SERVICE_URL;
  const internalSecret = process.env.RESUME_INTERNAL_SECRET;

  if (!authServiceUrl || !internalSecret?.trim()) {
    throw new Error("Resume billing configuration is missing.");
  }

  // Stable ID: retry of the same user's same resume reuses
  // the original transaction instead of charging twice.
  const transactionId = `resume-scorer:${userId}:${fingerprint}`;

  const response = await fetch(
    `${authServiceUrl.replace(/\/+$/, "")}/api/auth/internal/deduct-resume-scorer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
        "x-internal-service-secret": internalSecret,
      },
      body: JSON.stringify({
        amount: RESUME_SCORER_PRICE,
        action: "resume-scorer",
        transactionId,
      }),
      signal: AbortSignal.timeout(15000),
    },
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success !== true) {
    const error = new Error(result.message || "Resume Scorer billing failed.");

    error.status = response.status || 503;
    throw error;
  }

  return result;
};

const resumeCacheKey = (userId, resumeId) => `resume:${userId}:${resumeId}`;

const legacyResumeCacheKey = (userId) => `resume:${userId}`;

const isValidObjectId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

const getUserId = (req) => {
  const value = req.internalUserId;

  if (typeof value !== "string" || !isValidObjectId(value)) {
    return null;
  }

  return value;
};

const normalizeResumeText = (value = "") =>
  String(value).replace(/\r\n/g, "\n").trim().replace(/\s+/g, " ");

const getContentFingerprint = (text) =>
  crypto.createHash("sha256").update(text).digest("hex");

const logError = (operation, error) => {
  console.error(`[Resume] ${operation}:`, {
    message: error?.message,
    code: error?.code,
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
    await redis.set(key, value);
  } catch (error) {
    logError("Redis write failed", error);
  }
};

const safeCacheDelete = async (...keys) => {
  try {
    if (keys.length) {
      await redis.del(...keys);
    }
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
    if (error.code !== "ENOENT") {
      logError("Temporary file cleanup failed", error);
    }
  }
};

const sendServerError = (res, operation) => {
  return res.status(500).json({
    success: false,
    message: `Failed to ${operation}. Please try again.`,
  });
};

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

    if (!normalizedText) {
      return res.status(400).json({
        success: false,
        message: "Could not extract readable text from the resume PDF",
      });
    }

    const maxTextLength = Number(process.env.RESUME_MAX_TEXT_LENGTH ?? 50000);

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

    // Indexed fingerprint lookup instead of loading every resume.
    const contentFingerprint = getContentFingerprint(normalizedText);

    const existingResume = await Resume.findOne({
      userId,
      contentFingerprint,
    }).sort({ updatedAt: -1 });

    if (existingResume) {
      await cacheResume(userId, existingResume);

      return res.status(200).json({
        success: true,
        reused: true,
        message: "This resume already exists. Existing analysis reused.",
        data: existingResume,
      });
    }

    // AI runs only when no matching resume exists.
    const analyzedResume = await resumeAgent(normalizedText);

    // Create the report only after AI analysis succeeds.
    const resume = await Resume.create({
      ...analyzedResume,
      userId,
      extractedText: normalizedText,
      contentFingerprint,
    });

    try {
      await deductResumeScorerBalance(userId, contentFingerprint);
    } catch (billingError) {
      // Do not leave an unpaid report accessible.
      await Resume.deleteOne({
        _id: resume._id,
        userId,
      });

      await safeCacheDelete(
        legacyResumeCacheKey(userId),
        resumeCacheKey(userId, String(resume._id)),
      );

      return res.status(billingError.status === 400 ? 400 : 503).json({
        success: false,
        message:
          billingError.status === 400
            ? billingError.message
            : "Billing could not be confirmed. Please retry safely.",
      });
    }

    await cacheResume(userId, resume);

    return res.status(201).json({
      success: true,
      reused: false,
      message: "Resume analyzed and saved successfully",
      data: resume,
    });
  } catch (error) {
    logError("Upload failed", error);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.status && error.status < 500
          ? error.message
          : "Failed to analyze the resume. Please try again.",
    });
  } finally {
    await deleteTempFile(filePath);
  }
};

// GET /api/resumes/get-resume
// Backward-compatible endpoint: returns the latest resume.
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
          isValidObjectId(String(parsed?._id))
        ) {
          return res.status(200).json({
            success: true,
            source: "redis",
            data: parsed,
          });
        }
      } catch {
        // Malformed cache: fall through to MongoDB.
      }

      await safeCacheDelete(cacheKey);
    }

    const resume = await Resume.findOne({ userId }).sort({
      updatedAt: -1,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    await cacheResume(userId, resume);

    return res.status(200).json({
      success: true,
      source: "mongodb",
      data: resume,
    });
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

    const resumes = await Resume.find({ userId })
      .select(
        "_id profile.name profile.email createdAt updatedAt processing.status",
      )
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    logError("List resumes failed", error);
    return sendServerError(res, "list resumes");
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
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID",
      });
    }

    const cacheKey = resumeCacheKey(userId, resumeId);
    const cached = await safeCacheGet(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);

        if (
          String(parsed?._id) === resumeId &&
          String(parsed?.userId) === userId
        ) {
          return res.status(200).json({
            success: true,
            source: "redis",
            data: parsed,
          });
        }
      } catch {
        // Malformed cache: fall through to MongoDB.
      }

      await safeCacheDelete(cacheKey);
    }

    // Ownership is enforced in the database query itself.
    const resume = await Resume.findOne({
      _id: resumeId,
      userId,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    await safeCacheSet(cacheKey, JSON.stringify(resume));

    return res.status(200).json({
      success: true,
      source: "mongodb",
      data: resume,
    });
  } catch (error) {
    logError("Get resume by ID failed", error);
    return sendServerError(res, "fetch the resume");
  }
};

// PATCH /api/resumes/update
// Supports legacy requests without resumeId.
export const updateResume = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user identity is required",
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
    } = req.body || {};

    if (resumeId !== undefined && !isValidObjectId(resumeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID",
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

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No editable resume fields were provided",
      });
    }

    // Never accept userId or extractedText from the request body.
    const filter = resumeId ? { _id: resumeId, userId } : { userId };

    const resume = await Resume.findOneAndUpdate(
      filter,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        sort: { updatedAt: -1 },
      },
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // Update the specific cache and replace the legacy latest-resume cache.
    // Redis failures must not turn a successful MongoDB update into a 500.
    await safeCacheDelete(legacyResumeCacheKey(userId));

    await safeCacheSet(
      resumeCacheKey(userId, String(resume._id)),
      JSON.stringify(resume),
    );

    await safeCacheSet(legacyResumeCacheKey(userId), JSON.stringify(resume));

    return res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      data: resume,
    });
  } catch (error) {
    logError("Update resume failed", error);
    return sendServerError(res, "update the resume");
  }
};
