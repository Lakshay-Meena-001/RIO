import "dotenv/config";

// ============================================================
// CONFIG
// ============================================================

const RESUME_SERVICE_URL =
  process.env.RESUME_SERVICE_URL || "http://localhost:5004";

const REQUEST_TIMEOUT_MS = Number(
  process.env.RESUME_SERVICE_TIMEOUT_MS || 8000,
);

// ============================================================
// ERRORS
// ============================================================

class ResumeServiceError extends Error {
  constructor(
    message,
    { statusCode = 502, code = "RESUME_SERVICE_ERROR", details = null } = {},
  ) {
    super(message);

    this.name = "ResumeServiceError";

    this.statusCode = statusCode;

    this.code = code;

    this.details = details;
  }
}

// ============================================================
// HELPERS
// ============================================================

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  return [];
}

function buildResumeServiceUrl() {
  return `${RESUME_SERVICE_URL}/get-resume`;
}

// ============================================================
// FETCH RESUME
// ============================================================

async function fetchResume({ userId }) {
  if (!userId) {
    throw new ResumeServiceError("userId is required to fetch resume context", {
      statusCode: 400,
      code: "RESUME_USER_ID_REQUIRED",
    });
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildResumeServiceUrl(), {
      method: "GET",

      headers: {
        Accept: "application/json",

        "X-User-Id": String(userId),

        /**
         * Used to distinguish
         * internal service-to-service
         * communication.
         */
        "X-Internal-Service": "roadmap",
      },

      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";

    let payload = null;

    if (contentType.includes("application/json")) {
      payload = await response.json();
    } else {
      const text = await response.text();

      payload = {
        message: text,
      };
    }

    // --------------------------------------------------------
    // RESUME NOT FOUND
    // --------------------------------------------------------

    if (response.status === 404) {
      throw new ResumeServiceError("No resume found for this user", {
        statusCode: 404,
        code: "RESUME_NOT_FOUND",
        details: payload,
      });
    }

    // --------------------------------------------------------
    // OTHER HTTP ERRORS
    // --------------------------------------------------------

    if (!response.ok) {
      throw new ResumeServiceError(
        payload?.message || "Resume Service request failed",
        {
          statusCode: 502,
          code: "RESUME_SERVICE_REQUEST_FAILED",
          details: payload,
        },
      );
    }

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    return payload;
  } catch (error) {
    // Don't wrap our own typed errors.
    if (error instanceof ResumeServiceError) {
      throw error;
    }

    // AbortController timeout
    if (error?.name === "AbortError") {
      throw new ResumeServiceError("Resume Service request timed out", {
        statusCode: 504,
        code: "RESUME_SERVICE_TIMEOUT",
      });
    }

    // Network / connection failure
    throw new ResumeServiceError("Unable to reach Resume Service", {
      statusCode: 502,
      code: "RESUME_SERVICE_UNAVAILABLE",
      details: {
        message: error?.message,
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================================
// NORMALIZE RESUME
// ============================================================

function normalizeResumeContext(payload) {
  /**
   * Resume Service currently returns:
   *
   * {
   *   success: true,
   *   source: "...",
   *   data: {...}
   * }
   *
   * Keep the Roadmap Service independent
   * from the exact external response shape.
   */

  const resume = payload?.data || payload?.resume || null;

  if (!resume) {
    throw new ResumeServiceError("Resume Service returned no resume data", {
      statusCode: 502,
      code: "INVALID_RESUME_RESPONSE",
    });
  }

  return {
    id: resume._id || resume.id || null,

    version: resume.version || resume.updatedAt || resume.updated_at || null,

    profile: resume.profile || null,

    summary: normalizeString(resume.summary),

    skills: normalizeArray(resume.skills),

    technologies: normalizeArray(resume.technologies),

    experience: normalizeArray(resume.experience),

    projects: normalizeArray(resume.projects),

    education: normalizeArray(resume.education),

    certifications: normalizeArray(resume.certifications),

    achievements: normalizeArray(resume.achievements),

    languages: normalizeArray(resume.languages),

    analysis: resume.analysis || null,

    processing: resume.processing || null,

    updatedAt: resume.updatedAt || null,
  };
}

// ============================================================
// PUBLIC SERVICE
// ============================================================

class ResumeContextService {
  /**
   * Fetch and normalize the user's
   * resume from Resume Service.
   *
   * IMPORTANT:
   *
   * resumeId is currently NOT required
   * because the existing Resume Service
   * supports one resume per user.
   *
   * Once Resume Service supports
   * multiple resumes, this adapter can
   * switch to:
   *
   * GET /api/resumes/:resumeId
   */
  async getResume({ userId, resumeId = null }) {
    const payload = await fetchResume({
      userId,
    });

    const resume = normalizeResumeContext(payload);

    /**
     * If a future Resume Service
     * supports multiple resumes,
     * validate the requested resumeId.
     */
    if (resumeId && resume.id && String(resume.id) !== String(resumeId)) {
      throw new ResumeServiceError(
        "Requested resume does not belong to the current resume context",
        {
          statusCode: 404,
          code: "RESUME_ID_MISMATCH",
        },
      );
    }

    return resume;
  }
}

// ============================================================
// EXPORT
// ============================================================

const resumeContextService = new ResumeContextService();

export { ResumeServiceError, normalizeResumeContext };

export default resumeContextService;
