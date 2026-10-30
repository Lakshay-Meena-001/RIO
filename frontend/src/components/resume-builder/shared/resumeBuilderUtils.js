import {
  Award, BriefcaseBusiness, FolderKanban, GraduationCap, Languages,
  Sparkles, Target, UserRound, Wrench,
} from "lucide-react";
import initialResumeData from "../../resume/initialData";

export const TEMPLATES = [
  { id: "basic", name: "Basic", subtitle: "ATS clean" },
  { id: "modern", name: "Modern", subtitle: "Contemporary" },
  { id: "professional", name: "Professional", subtitle: "Classic" },
];

export const SECTIONS = [
  {
    label: "Personal details",
    hint: "Contact & profile",
    Icon: UserRound,
    terms: ["profile", "personal details"],
  },
  {
    label: "Professional summary",
    hint: "Your introduction",
    Icon: Target,
    terms: ["professional summary", "summary", "objective"],
  },
  {
    label: "Work experience",
    hint: "Roles & impact",
    Icon: BriefcaseBusiness,
    terms: ["work experience", "experience"],
  },
  {
    label: "Education",
    hint: "Academic background",
    Icon: GraduationCap,
    terms: ["education", "academic"],
  },
  {
    label: "Projects",
    hint: "Things you built",
    Icon: FolderKanban,
    terms: ["projects", "project"],
  },
  {
    label: "Skills",
    hint: "Technical strengths",
    Icon: Wrench,
    terms: ["skills", "skill"],
  },
  {
    label: "Certifications",
    hint: "Credentials",
    Icon: Award,
    terms: ["certifications", "certification"],
  },
  {
    label: "Achievements",
    hint: "Highlights & awards",
    Icon: Sparkles,
    terms: ["achievements", "achievement"],
  },
  {
    label: "Languages",
    hint: "Languages you know",
    Icon: Languages,
    terms: ["languages", "language"],
  },
];

export function clone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

export function createBlankResume() {
  const blank = clone(initialResumeData);
  const blankProfile = Object.fromEntries(
    Object.keys(blank.profile || {}).map((key) => [key, ""]),
  );
  return {
    ...blank,
    profile: blankProfile,
    summary: "",
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    achievements: [],
    languages: [],
  };
}

export function normalizeResume(resume) {
  if (!resume) return clone(initialResumeData);
  return {
    ...clone(initialResumeData),
    ...resume,
    profile: {
      ...(initialResumeData.profile || {}),
      ...(resume.profile || {}),
    },
    summary: resume.summary || "",
    education: Array.isArray(resume.education) ? clone(resume.education) : [],
    experience: Array.isArray(resume.experience)
      ? clone(resume.experience)
      : [],
    projects: Array.isArray(resume.projects) ? clone(resume.projects) : [],
    skills: Array.isArray(resume.skills) ? clone(resume.skills) : [],
    certifications: Array.isArray(resume.certifications)
      ? clone(resume.certifications)
      : [],
    achievements: Array.isArray(resume.achievements)
      ? clone(resume.achievements)
      : [],
    languages: Array.isArray(resume.languages) ? clone(resume.languages) : [],
  };
}

export function unwrapResume(response) {
  if (response?.data?.data?.profile) return response.data.data;
  if (response?.data?.profile) return response.data;
  if (response?.profile) return response;
  return null;
}

export function hasResumeContent(data) {
  const profile = data?.profile || {};
  return Boolean(
    Object.values(profile).some((value) => String(value || "").trim()) ||
    String(data?.summary || "").trim() ||
    [
      "education",
      "experience",
      "projects",
      "skills",
      "certifications",
      "achievements",
      "languages",
    ].some((key) =>
      (data?.[key] || []).some((item) =>
        typeof item === "string"
          ? item.trim()
          : Object.values(item || {}).some((value) =>
              Array.isArray(value)
                ? value.some((entry) => String(entry).trim())
                : String(value || "").trim(),
            ),
      ),
    ),
  );
}

export function getValidationFieldErrors(data) {
  const errors = {};
  const profile = data?.profile || {};
  if (!profile.name?.trim()) errors.name = "Full name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email?.trim() || ""))
    errors.email = "Enter a valid email address.";
  if ((profile.phone || "").replace(/\D/g, "").length < 7)
    errors.phone = "Enter a valid phone number.";
  if ((data?.summary || "").trim().length < 30)
    errors.summary = "Add a professional summary of at least 30 characters.";
  const education = data?.education || [];
  if (
    !education.some((item) => item.institution?.trim() && item.degree?.trim())
  )
    errors.education =
      "Add at least one education entry with institution and degree.";
  if (
    education.some(
      (item) =>
        Object.values(item || {}).some((value) => String(value || "").trim()) &&
        !(item.institution?.trim() && item.degree?.trim()),
    )
  )
    errors.educationEntries =
      "Complete the institution and degree for each education entry you started, or remove the incomplete entry.";
  if ((data?.skills || []).filter((item) => String(item).trim()).length < 3)
    errors.skills = "Add at least 3 skills.";
  const projects = data?.projects || [];
  const experience = data?.experience || [];
  const hasProject = projects.some(
    (item) => item.title?.trim() && item.description?.trim(),
  );
  const hasExperience = experience.some(
    (item) =>
      item.company?.trim() && item.role?.trim() && item.description?.trim(),
  );
  if (
    projects.some(
      (item) =>
        Object.values(item || {}).some((value) =>
          Array.isArray(value)
            ? value.some((entry) => String(entry).trim())
            : String(value || "").trim(),
        ) && !(item.title?.trim() && item.description?.trim()),
    )
  )
    errors.projectEntries =
      "Complete the title and description for each project you started, or remove the incomplete project.";
  if (
    experience.some(
      (item) =>
        Object.values(item || {}).some((value) =>
          Array.isArray(value)
            ? value.some((entry) => String(entry).trim())
            : String(value || "").trim(),
        ) &&
        !(
          item.company?.trim() &&
          item.role?.trim() &&
          item.description?.trim()
        ),
    )
  )
    errors.experienceEntries =
      "Complete company, role and description for each work entry you started, or remove the incomplete entry.";
  if (!hasProject && !hasExperience)
    errors.projectExperience =
      "Add at least one complete project or work experience.";
  return errors;
}

export function getCompletion(data) {
  const profile = data?.profile || {};
  const checks = [
    Boolean(profile.name?.trim()),
    Boolean(profile.email?.trim()),
    Boolean(profile.phone?.trim()),
    Boolean(profile.location?.trim()),
    Boolean(data?.summary?.trim()),
    Boolean(data?.education?.length),
    Boolean(data?.experience?.length),
    Boolean(data?.projects?.length),
    Boolean(data?.skills?.length),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

