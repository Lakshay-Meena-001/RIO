import toast from "react-hot-toast";
import { getCurrentUser, updateProfessionalProfile } from "../../../api/user/user.api";
import { Field, TextField, TagInput, FormSection, EntryHeader, EmptyState } from "../shared/ResumeFormFields";

export function ProfileSection(props) {
  const { data, fieldErrors, updateProfile, profileImportButton } = props;
  return (
    <FormSection
        title="Profile"
        description="Your core identity and professional links."
      >
        <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
          <Field
            label="Full Name"
            value={data.profile?.name}
            onChange={(value) => updateProfile("name", value)}
            placeholder="e.g. Rahul Sharma"
            error={fieldErrors.name}
          />

          <Field
            label="Email"
            value={data.profile?.email}
            onChange={(value) => updateProfile("email", value)}
            placeholder="you@example.com"
            type="email"
            error={fieldErrors.email}
          />

          <Field
            label="Phone"
            value={data.profile?.phone}
            onChange={(value) => updateProfile("phone", value)}
            placeholder="+91 98765 43210"
            type="tel"
            error={fieldErrors.phone}
          />

          <div className="min-w-0">
            <Field
              label="Location"
              value={data.profile?.location}
              onChange={(value) => updateProfile("location", value)}
              placeholder="Delhi, India"
            />
            {profileImportButton(
              "location",
              "location",
              data.profile?.location,
              "Location",
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <Field
              label="LinkedIn"
              value={data.profile?.linkedIn}
              onChange={(value) => updateProfile("linkedIn", value)}
              placeholder="https://linkedin.com/in/username"
            />
            {profileImportButton(
              "linkedIn",
              "linkedinUrl",
              data.profile?.linkedIn,
              "LinkedIn",
            )}
          </div>

          <div className="min-w-0">
            <Field
              label="GitHub"
              value={data.profile?.github}
              onChange={(value) => updateProfile("github", value)}
              placeholder="https://github.com/username"
            />
            {profileImportButton(
              "github",
              "githubUrl",
              data.profile?.github,
              "GitHub",
            )}
          </div>

          <div className="min-w-0">
            <Field
              label="Portfolio"
              value={data.profile?.portfolio}
              onChange={(value) => updateProfile("portfolio", value)}
              placeholder="https://yourportfolio.com"
            />
            {profileImportButton(
              "portfolio",
              "portfolioUrl",
              data.profile?.portfolio,
              "Portfolio",
            )}
          </div>

          <Field
            label="LeetCode"
            value={data.profile?.leetcode}
            onChange={(value) => updateProfile("leetcode", value)}
            placeholder="https://leetcode.com/username"
            hint="Optional. Add the profile URL only."
          />
        </div>
      </FormSection>
  );
}

export function SummarySection(props) {
  const { data, fieldErrors, updateRootField, profileImportButton } = props;
  return (
    <FormSection
        title="Professional Summary"
        description="A concise overview of your background, strengths and career direction."
      >
        <TextField
          label="Summary"
          value={data.summary}
          onChange={(value) => updateRootField("summary", value)}
          placeholder="Write a concise professional summary..."
          rows={7}
          recommended={700}
          error={fieldErrors.summary}
          hint="Aim for roughly 80–120 words. Focus on role, strongest skills, experience level and target direction."
        />
        {profileImportButton("summary", "bio", data.summary, "Summary")}
      </FormSection>
  );
}

export function ExperienceSection(props) {
  const { data, fieldErrors, addExperience, updateExperience, removeExperience } = props;
  return (
    <FormSection
        title="Work Experience"
        description="Add your professional experience. Most recent experience should normally come first."
        action={
          <button
            type="button"
            onClick={addExperience}
            className="w-full rounded-lg border border-white/[.12] bg-white/[.04] px-3.5 py-2.5 text-xs font-medium text-white/80 transition hover:bg-white/[.075] sm:w-auto"
          >
            + Add Experience
          </button>
        }
      >
        <div className="space-y-4">
          {(data.experience || []).map((experience, index) => (
            <div
              key={index}
              className="
                w-full min-w-0 rounded-2xl border border-white/[.075] bg-black/[.12] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.02)] sm:p-5
              "
            >
              <EntryHeader
                title={`Experience ${index + 1}`}
                subtitle="Company, role, dates and technical details"
                onRemove={() => removeExperience(index)}
              />

              <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
                <Field
                  label="Company"
                  value={experience.company}
                  onChange={(value) =>
                    updateExperience(index, "company", value)
                  }
                  placeholder="Company name"
                />

                <Field
                  label="Role"
                  value={experience.role}
                  onChange={(value) => updateExperience(index, "role", value)}
                  placeholder="Software Engineer"
                />

                <Field
                  label="Location"
                  value={experience.location}
                  onChange={(value) =>
                    updateExperience(index, "location", value)
                  }
                  placeholder="Bengaluru, India"
                />

                <div className="grid grid-cols-2 gap-3 min-w-0">
                  <Field
                    label="Start Date"
                    value={experience.startDate}
                    onChange={(value) =>
                      updateExperience(index, "startDate", value)
                    }
                    placeholder="Jan 2024"
                  />

                  <Field
                    label="End Date"
                    value={experience.endDate}
                    onChange={(value) =>
                      updateExperience(index, "endDate", value)
                    }
                    placeholder="Present"
                  />
                </div>
              </div>

              <div className="mt-4">
                <TextField
                  label="Description"
                  value={experience.description}
                  onChange={(value) =>
                    updateExperience(index, "description", value)
                  }
                  placeholder="Describe what you built or owned, the technologies used, and measurable impact..."
                  rows={8}
                  recommended={1200}
                  hint="Prefer 3–5 strong bullet-style sentences with action + technology + result."
                />
              </div>

              <div className="mt-4">
                <TagInput
                  label="Technologies"
                  values={experience.technologies || []}
                  onChange={(value) =>
                    updateExperience(index, "technologies", value)
                  }
                  placeholder="Type a technology and press Enter"
                />
              </div>

              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="mt-5 w-full rounded-lg border border-red-400/10 bg-red-400/[0.04] px-3 py-2.5 text-xs font-medium text-red-300/80 transition hover:border-red-400/20 hover:bg-red-400/[0.08] sm:hidden"
              >
                Remove Experience
              </button>
            </div>
          ))}

          {(!data.experience || data.experience.length === 0) && (
            <EmptyState
              title="No experience added"
              description="Add professional experience if you have it. You can leave this section empty for a fresher resume."
              actionLabel="Add Experience"
              onClick={addExperience}
            />
          )}
        </div>
        {fieldErrors.experienceEntries && (
          <p role="alert" className="mt-3 text-[11px] leading-4 text-red-300">
            {fieldErrors.experienceEntries}
          </p>
        )}
      </FormSection>
  );
}

export function EducationSection(props) {
  const { data, fieldErrors, addEducation, updateEducation, removeEducation } = props;
  return (
    <FormSection
        title="Education"
        description="Add your academic background."
        action={
          <button
            type="button"
            onClick={addEducation}
            className="w-full rounded-lg border border-white/[.12] bg-white/[.04] px-3.5 py-2.5 text-xs font-medium text-white/80 transition hover:bg-white/[.075] sm:w-auto"
          >
            + Add Education
          </button>
        }
      >
        <div className="space-y-4">
          {(data.education || []).map((education, index) => (
            <div
              key={index}
              className="
                w-full min-w-0 rounded-2xl border border-white/[.075] bg-black/[.12] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.02)] sm:p-5
              "
            >
              <EntryHeader
                title={`Education ${index + 1}`}
                subtitle="Institution, degree and academic details"
                onRemove={() => removeEducation(index)}
              />

              <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
                <Field
                  label="Institution"
                  value={education.institution}
                  onChange={(value) =>
                    updateEducation(index, "institution", value)
                  }
                  placeholder="University / College"
                />

                <Field
                  label="Degree"
                  value={education.degree}
                  onChange={(value) => updateEducation(index, "degree", value)}
                  placeholder="B.Tech"
                />

                <Field
                  label="Field of Study"
                  value={education.field}
                  onChange={(value) => updateEducation(index, "field", value)}
                  placeholder="Computer Science"
                />

                <div className="grid grid-cols-2 gap-3 min-w-0">
                  <Field
                    label="Start Date"
                    value={education.startDate}
                    onChange={(value) =>
                      updateEducation(index, "startDate", value)
                    }
                    placeholder="2020"
                  />

                  <Field
                    label="End Date"
                    value={education.endDate}
                    onChange={(value) =>
                      updateEducation(index, "endDate", value)
                    }
                    placeholder="2024"
                  />
                </div>
              </div>

              <div className="mt-4">
                <TextField
                  label="Description"
                  value={education.description}
                  onChange={(value) =>
                    updateEducation(index, "description", value)
                  }
                  placeholder="Optional: relevant coursework, academic achievements or additional details..."
                  rows={5}
                  recommended={500}
                  hint="Optional. Leave empty if the degree details already provide enough information."
                />
              </div>

              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="mt-5 w-full rounded-lg border border-red-400/10 bg-red-400/[0.04] px-3 py-2.5 text-xs font-medium text-red-300/80 transition hover:border-red-400/20 hover:bg-red-400/[0.08] sm:hidden"
              >
                Remove Education
              </button>
            </div>
          ))}

          {(!data.education || data.education.length === 0) && (
            <EmptyState
              title="No education added"
              description="Add your degree or other relevant academic qualifications."
              actionLabel="Add Education"
              onClick={addEducation}
            />
          )}
        </div>
        {fieldErrors.education && (
          <p role="alert" className="mt-3 text-[11px] leading-4 text-red-300">
            {fieldErrors.education}
          </p>
        )}
        {fieldErrors.educationEntries && (
          <p role="alert" className="mt-2 text-[11px] leading-4 text-red-300">
            {fieldErrors.educationEntries}
          </p>
        )}
      </FormSection>
  );
}

export function ProjectsSection(props) {
  const { data, fieldErrors, addProject, updateProject, removeProject } = props;
  return (
    <FormSection
        title="Projects"
        description="Showcase projects that demonstrate your technical skills and impact."
        action={
          <button
            type="button"
            onClick={addProject}
            className="w-full rounded-lg border border-white/[.12] bg-white/[.04] px-3.5 py-2.5 text-xs font-medium text-white/80 transition hover:bg-white/[.075] sm:w-auto"
          >
            + Add Project
          </button>
        }
      >
        <div className="space-y-4">
          {(data.projects || []).map((project, index) => (
            <div
              key={index}
              className="
                w-full min-w-0 rounded-2xl border border-white/[.075] bg-black/[.12] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.02)] sm:p-5
              "
            >
              <EntryHeader
                title={`Project ${index + 1}`}
                subtitle="Project details, links and technologies"
                onRemove={() => removeProject(index)}
              />

              <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
                <Field
                  label="Project Title"
                  value={project.title}
                  onChange={(value) => updateProject(index, "title", value)}
                  placeholder="AI Resume Analyzer"
                />

                <div className="grid grid-cols-2 gap-3 min-w-0">
                  <Field
                    label="Start Date"
                    value={project.startDate}
                    onChange={(value) =>
                      updateProject(index, "startDate", value)
                    }
                    placeholder="Jan 2025"
                  />

                  <Field
                    label="End Date"
                    value={project.endDate}
                    onChange={(value) => updateProject(index, "endDate", value)}
                    placeholder="Mar 2025"
                  />
                </div>

                <Field
                  label="Live URL"
                  value={project.url}
                  onChange={(value) => updateProject(index, "url", value)}
                  placeholder="https://example.com"
                />

                <Field
                  label="GitHub URL"
                  value={project.githubUrl}
                  onChange={(value) => updateProject(index, "githubUrl", value)}
                  placeholder="https://github.com/username/project"
                />
              </div>

              <div className="mt-4">
                <TextField
                  label="Description"
                  value={project.description}
                  onChange={(value) =>
                    updateProject(index, "description", value)
                  }
                  placeholder="Explain what you built, the problem it solves, your contribution and the result..."
                  rows={8}
                  recommended={1000}
                  hint="Focus on your contribution, important technical decisions and measurable outcome."
                />
              </div>

              <div className="mt-4">
                <TagInput
                  label="Technologies"
                  values={project.technologies || []}
                  onChange={(value) =>
                    updateProject(index, "technologies", value)
                  }
                  placeholder="React, Node.js, MongoDB..."
                />
              </div>

              <button
                type="button"
                onClick={() => removeProject(index)}
                className="mt-5 w-full rounded-lg border border-red-400/10 bg-red-400/[0.04] px-3 py-2.5 text-xs font-medium text-red-300/80 transition hover:border-red-400/20 hover:bg-red-400/[0.08] sm:hidden"
              >
                Remove Project
              </button>
            </div>
          ))}

          {(!data.projects || data.projects.length === 0) && (
            <EmptyState
              title="No projects added"
              description="Add projects that are relevant to the role you are targeting."
              actionLabel="Add Project"
              onClick={addProject}
            />
          )}
        </div>
        {fieldErrors.projectExperience && (
          <p role="alert" className="mt-3 text-[11px] leading-4 text-red-300">
            {fieldErrors.projectExperience}
          </p>
        )}
        {fieldErrors.projectEntries && (
          <p role="alert" className="mt-2 text-[11px] leading-4 text-red-300">
            {fieldErrors.projectEntries}
          </p>
        )}
      </FormSection>
  );
}

export function SkillsSection(props) {
  const { data, fieldErrors, updateRootField, profileImportStatus, setProfileImportStatus, importToProfile } = props;
  return (
    <FormSection
        title="Skills"
        description="Add technical and professional skills as individual tags."
      >
        <TagInput
          label="Skills"
          values={data.skills || []}
          onChange={(value) => updateRootField("skills", value)}
          placeholder="JavaScript, React, Node.js..."
          hint="Press Enter after each skill. Keep the list focused on skills relevant to your target role."
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              importToProfile("skills", "skills", data.skills || [], "Skills")
            }
            className="mt-0 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/30 bg-transparent px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Replace Profile Skills
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                const currentUser = await getCurrentUser();
                const existing = Array.isArray(currentUser?.user?.skills)
                  ? currentUser.user.skills
                  : Array.isArray(currentUser?.skills)
                    ? currentUser.skills
                    : [];
                await updateProfessionalProfile({
                  skills: [...new Set([...existing, ...(data.skills || [])])],
                });
                setProfileImportStatus((current) => ({
                  ...current,
                  skills: "Added to Profile",
                }));
                toast.success("Skills added to Profile");
              } catch (error) {
                const message =
                  error?.response?.data?.message || "Could not update Profile.";
                setProfileImportStatus((current) => ({
                  ...current,
                  skills: message,
                }));
                toast.error(message);
              }
            }}
            className="rounded-lg border border-white/[.12] bg-white/[.04] px-3 py-1.5 text-[11px] font-medium text-white/80 transition hover:bg-white/[.08]"
          >
            Merge Profile Skills
          </button>
        </div>
        {profileImportStatus.skills && (
          <p role="status" className="mt-1 text-[11px] text-emerald-400">
            {profileImportStatus.skills}
          </p>
        )}
        {fieldErrors.skills && (
          <p role="alert" className="mt-3 text-[11px] leading-4 text-red-300">
            {fieldErrors.skills}
          </p>
        )}
      </FormSection>
  );
}

export function CertificationsSection(props) {
  const { data, updateRootField } = props;
  return (
    <FormSection
        title="Certifications"
        description="Add relevant certifications, courses or credentials."
      >
        <TagInput
          label="Certifications"
          values={data.certifications || []}
          onChange={(value) => updateRootField("certifications", value)}
          placeholder="AWS Certified Cloud Practitioner..."
        />
      </FormSection>
  );
}

export function AchievementsSection(props) {
  const { data, updateRootField } = props;
  return (
    <FormSection
        title="Achievements"
        description="Add measurable achievements, awards, competitive programming milestones or leadership accomplishments."
      >
        <TagInput
          label="Achievements"
          values={data.achievements || []}
          onChange={(value) => updateRootField("achievements", value)}
          placeholder="Solved 500+ problems on LeetCode..."
          hint="Only add achievements that are accurate and verifiable."
        />
      </FormSection>
  );
}

export function LanguagesSection(props) {
  const { data, updateRootField } = props;
  return (
    <FormSection
        title="Languages"
        description="Add languages you can communicate in."
      >
        <TagInput
          label="Languages"
          values={data.languages || []}
          onChange={(value) => updateRootField("languages", value)}
          placeholder="English, Hindi..."
        />
      </FormSection>
  );
}

