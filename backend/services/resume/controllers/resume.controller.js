import { resumeAgent } from "../agents/resume.agent.js";
import extractText from "../config/pdf.js";
import Resume from "../models/resume.model.js";
import fs from "fs";
import redis from "../../../shared/redis/redis.js";

export const uploadResume = async (req, res) => {
  let file;

  try {
    file = req.file;

    // 1. Check whether PDF was uploaded
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Resume PDF is required",
      });
    }

    // 2. Get authenticated user ID from Gateway
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    // 3. Extract text from PDF
    const resumeText = await extractText(file.path);

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from the resume PDF",
      });
    }

    // 4. Send extracted text to AI
    const analyzedResume = await resumeAgent(resumeText);

    // 5. Find existing resume for this user
    let resume = await Resume.findOne({ userId });

    if (resume) {
      // Update existing resume
      Object.assign(resume, {
        ...analyzedResume,
        extractedText: resumeText,
      });

      await resume.save();
    } else {
      // Create new resume
      resume = await Resume.create({
        userId,
        extractedText: resumeText,
        ...analyzedResume,
      });
    }

    // 6. Update Redis cache
    await redis.set(`resume:${userId}`, JSON.stringify(resume));

    // 7. Delete temporary PDF
    await fs.promises.unlink(file.path);
    file = null;

    // 8. Send response
    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully",
      data: resume,
    });
  } catch (error) {
    console.error("Resume upload error:", error);

    // Delete temporary file if it still exists
    if (file?.path) {
      try {
        await fs.promises.unlink(file.path);
      } catch (cleanupError) {
        console.error("Failed to delete temporary resume file:", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze resume",
    });
  }
};

export const getResume = async (req, res) => {
  try {
    // 1. Get authenticated user ID
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    // 2. Check Redis first
    const cachedData = await redis.get(`resume:${userId}`);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: "redis",
        data: JSON.parse(cachedData),
      });
    }

    // 3. Redis miss → get data from MongoDB
    const resume = await Resume.findOne({ userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // 4. Store MongoDB result in Redis
    await redis.set(`resume:${userId}`, JSON.stringify(resume));

    // 5. Return MongoDB data
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

/**
 * Update resume data from Resume Builder.
 *
 * Only user-editable resume fields are accepted.
 * Protected/system fields such as userId, analysis,
 * processing and extractedText cannot be modified here.
 */
export const updateResume = async (req, res) => {
  try {
    // 1. Get authenticated user ID from Gateway
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    // 2. Pick only fields that Resume Builder is allowed to modify
    const {
      profile,
      summary,
      education,
      experience,
      projects,
      skills,
      certifications,
      achievements,
      languages,
    } = req.body;

    // 3. Build a whitelist-based update object
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

    // 4. Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // 5. Update only the authenticated user's resume
    const resume = await Resume.findOneAndUpdate(
      { userId },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // 6. Keep Redis synchronized with MongoDB
    await redis.set(`resume:${userId}`, JSON.stringify(resume));

    // 7. Return updated resume
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