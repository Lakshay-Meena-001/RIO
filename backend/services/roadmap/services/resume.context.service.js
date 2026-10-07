import "dotenv/config";

class ResumeContextService {
  constructor() {
    this.resumeServiceUrl =
      process.env.RESUME_SERVICE_URL || "http://localhost:5004";
  }

  /**
   * Build the URL for a user's selected resume.
   *
   * The exact endpoint can be adjusted when the
   * Resume Service route is wired.
   */
  buildResumeUrl(resumeId) {
    if (!resumeId) {
      throw new Error("resumeId is required");
    }

    return `${this.resumeServiceUrl}/api/resumes/${resumeId}`;
  }

  /**
   * Fetch a resume from Resume Service.
   *
   * Roadmap Service never accesses the Resume model directly.
   */
  async getResume({ userId, resumeId }) {
    if (!userId) {
      throw new Error("userId is required");
    }

    if (!resumeId) {
      throw new Error("resumeId is required");
    }

    const url = this.buildResumeUrl(resumeId);

    const response = await fetch(url, {
      method: "GET",

      headers: {
        "Content-Type": "application/json",

        /*
         * Internal service authentication can be
         * added here later.
         */
        "X-Internal-Service": "roadmap-service",

        "X-User-Id": String(userId),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Resume Service request failed (${response.status}): ${errorText}`,
      );
    }

    const data = await response.json();

    return data?.resume || data;
  }

  /**
   * Ensure the selected resume belongs to the user
   * and return only the context needed by Roadmap AI.
   */
  normalizeResumeContext(resume) {
    if (!resume) {
      throw new Error("Resume data is empty");
    }

    return {
      id: resume.id || resume._id || null,

      version: resume.version ?? resume.resumeVersion ?? null,

      profile: resume.profile || null,

      summary: resume.summary || null,

      skills: resume.skills || null,

      technologies: resume.technologies || null,

      experience: resume.experience || null,

      projects: resume.projects || null,

      education: resume.education || null,

      certifications: resume.certifications || null,

      achievements: resume.achievements || null,

      languages: resume.languages || null,
    };
  }

  /**
   * Complete operation used by Roadmap generation.
   */
  async getResumeContext({ userId, resumeId }) {
    const resume = await this.getResume({
      userId,
      resumeId,
    });

    return this.normalizeResumeContext(resume);
  }
}

const resumeContextService = new ResumeContextService();

export default resumeContextService;
