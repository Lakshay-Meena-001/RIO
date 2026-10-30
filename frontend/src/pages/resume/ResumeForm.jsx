import { useState } from "react";
import "./resume-builder.css";
import { updateProfessionalProfile } from "../../api/user/user.api";
import toast from "react-hot-toast";
import {
  emptyEducation,
  emptyExperience,
  emptyProject,
} from "../../components/resume-builder/shared/resumeBuilderConstants";
import {
  ProfileSection, SummarySection, ExperienceSection, EducationSection,
  ProjectsSection, SkillsSection, CertificationsSection, AchievementsSection, LanguagesSection,
} from "../../components/resume-builder/form/ResumeFormSections";

/* -------------------------------------------------------------------------- */
/*                               Small Helpers                                */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                              Resume Form                                   */
/* -------------------------------------------------------------------------- */

export default function ResumeForm({ data, onChange, fieldErrors = {} }) {
  const [profileImportStatus, setProfileImportStatus] = useState({});
  const importToProfile = async (key, profileField, value, label = key) => {
    const cleanValue = typeof value === "string" ? value.trim() : value;
    if (
      cleanValue == null ||
      cleanValue === "" ||
      (Array.isArray(cleanValue) && !cleanValue.length)
    ) {
      setProfileImportStatus((current) => ({
        ...current,
        [key]: "Add a value first.",
      }));
      return;
    }
    setProfileImportStatus((current) => ({ ...current, [key]: "Saving..." }));
    try {
      await updateProfessionalProfile({
        [profileField]: cleanValue,
      });
      setProfileImportStatus((current) => ({
        ...current,
        [key]: "Added to Profile",
      }));
      toast.success(`${label} added to Profile`);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Could not update Profile.";
      setProfileImportStatus((current) => ({ ...current, [key]: message }));
      toast.error(message);
    }
  };
  const profileImportButton = (key, profileField, value, label = key) => (
    <div className="mt-2 flex justify-end">
      <button
        type="button"
        onClick={() => importToProfile(key, profileField, value, label)}
        className="mt-0 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/30 bg-transparent px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span aria-hidden="true">＋</span>
        Add to Profile
      </button>
      {profileImportStatus[key] && (
        <p
          role="status"
          className={`mt-1 text-[11px] ${profileImportStatus[key] === "Added to Profile" ? "text-emerald-400" : "text-white/50"}`}
        >
          {profileImportStatus[key]}
        </p>
      )}
    </div>
  );
  const updateProfile = (field, value) => {
    onChange({
      ...data,
      profile: {
        ...data.profile,
        [field]: value,
      },
    });
  };

  const updateRootField = (field, value) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  /* ------------------------------- Education ------------------------------ */

  const addEducation = () => {
    updateRootField("education", [
      ...(data.education || []),
      { ...emptyEducation },
    ]);
  };

  const updateEducation = (index, field, value) => {
    const updated = [...(data.education || [])];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    updateRootField("education", updated);
  };

  const removeEducation = (index) => {
    updateRootField(
      "education",
      (data.education || []).filter((_, i) => i !== index),
    );
  };

  /* ------------------------------- Experience ----------------------------- */

  const addExperience = () => {
    updateRootField("experience", [
      ...(data.experience || []),
      { ...emptyExperience },
    ]);
  };

  const updateExperience = (index, field, value) => {
    const updated = [...(data.experience || [])];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    updateRootField("experience", updated);
  };

  const removeExperience = (index) => {
    updateRootField(
      "experience",
      (data.experience || []).filter((_, i) => i !== index),
    );
  };

  /* -------------------------------- Projects ------------------------------ */

  const addProject = () => {
    updateRootField("projects", [
      ...(data.projects || []),
      { ...emptyProject },
    ]);
  };

  const updateProject = (index, field, value) => {
    const updated = [...(data.projects || [])];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    updateRootField("projects", updated);
  };

  const removeProject = (index) => {
    updateRootField(
      "projects",
      (data.projects || []).filter((_, i) => i !== index),
    );
  };

  const sectionProps = {
    data, fieldErrors, updateProfile, updateRootField, profileImportButton,
    profileImportStatus, setProfileImportStatus, importToProfile,
    addExperience, updateExperience, removeExperience,
    addEducation, updateEducation, removeEducation,
    addProject, updateProject, removeProject,
  };

  /* ------------------------------------------------------------------------ */

  return (
    <div className="w-full min-w-0 space-y-5">
      {/* Profile */}
      {/* ------------------------------------------------------------------ */}

      <ProfileSection {...sectionProps} />

      {/* ------------------------------------------------------------------ */}
      {/* Summary                                                           */}
      {/* ------------------------------------------------------------------ */}

      <SummarySection {...sectionProps} />

      {/* ------------------------------------------------------------------ */}
      {/* Experience                                                        */}
      {/* ------------------------------------------------------------------ */}

      <ExperienceSection {...sectionProps} />

      {/* ------------------------------------------------------------------ */}
      {/* Projects                                                          */}
      {/* ------------------------------------------------------------------ */}

      <EducationSection {...sectionProps} />

      <ProjectsSection {...sectionProps} />

      {/* ------------------------------------------------------------------ */}
      {/* Skills                                                            */}
      {/* ------------------------------------------------------------------ */}

      <SkillsSection {...sectionProps} />

      {/* ------------------------------------------------------------------ */}
      {/* Certifications                                                    */}
      {/* ------------------------------------------------------------------ */}

      <CertificationsSection {...sectionProps} />

      {/* ------------------------------------------------------------------ */}
      {/* Achievements                                                      */}
      {/* ------------------------------------------------------------------ */}

      <AchievementsSection {...sectionProps} />

      {/* ------------------------------------------------------------------ */}
      {/* Languages                                                         */}
      {/* ------------------------------------------------------------------ */}

      <LanguagesSection {...sectionProps} />
    </div>
  );
}
