import { resumeAgent } from "../agents/resume.agent.js";
import extractText from "../config/pdf.js";
import Resume from "../models/resume.model.js";
import fs from "fs";
import redis from "../../../shared/redis/redis.js";

const resumeCacheKey = (userId, resumeId) => `resume:${userId}:${resumeId}`;

const legacyResumeCacheKey = (userId) => `resume:${userId}`;

const normalizeResumeText = (value = "") =>
  String(value).replace(/\r\n/g, "\n").trim();

const isValidObjectId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

const getUserId = (req) => req.headers["x-user-id"];

const invalidateLegacyCache = async (userId) => {
  await redis.del(legacyResumeCacheKey(userId));
};

const deleteTempFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Temporary resume cleanup error:", error);
    }
  }
};

// ============================================================
// UPLOAD RESUME
// Same extracted text => reuse existing resume without AI call.
// Different text => create a separate resume.
// ============================================================

export const uploadResume = async (req, res) => {
  let filePath;

  try {
    const file = req.file;
    filePath = file?.path;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Resume PDF is required",
      });
    }

    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    const extractedText = await extractText(file.path);
    const normalizedText = normalizeResumeText(extractedText);

    if (!normalizedText) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from the resume PDF",
      });
    }

    // Check existing resumes BEFORE calling the AI agent.
    // This prevents repeat AI analysis when the same extracted text
    // already exists in MongoDB.
    const existingResumes = await Resume.find({ userId })
      .select("_id extractedText updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    const existingResume = existingResumes.find(
      (item) =>
        normalizeResumeText(item.extractedText || "") === normalizedText,
    );

    if (existingResume) {
      const fullResume = await Resume.findOne({
        _id: existingResume._id,
        userId,
      });

      if (fullResume) {
        await Promise.all([
          redis.set(legacyResumeCacheKey(userId), JSON.stringify(fullResume)),
          redis.set(
            resumeCacheKey(userId, String(fullResume._id)),
            JSON.stringify(fullResume),
          ),
        ]);

        return res.status(200).json({
          success: true,
          reused: true,
          message: "This resume already exists. Existing analysis reused.",
          data: fullResume,
        });
      }
    }

    // Only new resume content reaches the AI agent.
    const analyzedResume = await resumeAgent(normalizedText);

    const resume = await Resume.create({
      userId,
      extractedText: normalizedText,
      ...analyzedResume,
    });

    await Promise.all([
      invalidateLegacyCache(userId),
      redis.set(
        resumeCacheKey(userId, String(resume._id)),
        JSON.stringify(resume),
      ),
      redis.set(legacyResumeCacheKey(userId), JSON.stringify(resume)),
    ]);

    return res.status(201).json({
      success: true,
      reused: false,
      message: "Resume analyzed and saved successfully",
      data: resume,
    });
  } catch (error) {
    console.error("Resume upload error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze resume",
    });
  } finally {
    await deleteTempFile(filePath);
  }
};

// ============================================================
// GET LATEST RESUME — BACKWARD COMPATIBILITY
// Existing GET /get-resume continues to work.
// ============================================================

export const getResume = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    const cached = await redis.get(legacyResumeCacheKey(userId));

    if (cached) {
      try {
        const parsed = JSON.parse(cached);

        if (String(parsed?.userId) === String(userId)) {
          return res.status(200).json({
            success: true,
            source: "redis",
            data: parsed,
          });
        }
      } catch {
        // Invalid cache: fetch from MongoDB.
      }

      await redis.del(legacyResumeCacheKey(userId));
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

    await redis.set(legacyResumeCacheKey(userId), JSON.stringify(resume));

    return res.status(200).json({
      success: true,
      source: "mongodb",
      data: resume,
    });
  } catch (error) {
    console.error("Get resume error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch resume",
    });
  }
};

// ============================================================
// LIST RESUMES — DROPDOWN
// ============================================================

export const listResumes = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
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
    console.error("List resumes error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to list resumes",
    });
  }
};

// ============================================================
// GET SPECIFIC RESUME BY ID
// ============================================================

export const getResumeById = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { resumeId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    if (!isValidObjectId(resumeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID",
      });
    }

    const cacheKey = resumeCacheKey(userId, resumeId);
    const cached = await redis.get(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);

        if (
          String(parsed?._id) === String(resumeId) &&
          String(parsed?.userId) === String(userId)
        ) {
          return res.status(200).json({
            success: true,
            source: "redis",
            data: parsed,
          });
        }
      } catch {
        // Invalid cache: fetch from MongoDB.
      }

      await redis.del(cacheKey);
    }

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

    await redis.set(cacheKey, JSON.stringify(resume));

    return res.status(200).json({
      success: true,
      source: "mongodb",
      data: resume,
    });
  } catch (error) {
    console.error("Get resume by ID error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch resume",
    });
  }
};

// ============================================================
// UPDATE RESUME
// New clients send resumeId.
// Old clients without resumeId update the latest resume.
// ============================================================

export const updateResume = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
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

    if (resumeId && !isValidObjectId(resumeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID",
      });
    }

    const updateData = {
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

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No editable resume fields were provided",
      });
    }

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

    await Promise.all([
      invalidateLegacyCache(userId),
      redis.set(
        resumeCacheKey(userId, String(resume._id)),
        JSON.stringify(resume),
      ),
      redis.set(legacyResumeCacheKey(userId), JSON.stringify(resume)),
    ]);

    return res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      data: resume,
    });
  } catch (error) {
    console.error("Update resume error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update resume",
    });
  }
};
