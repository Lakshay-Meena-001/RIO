import { useEffect, useRef } from "react";
import React, { useState } from "react";

/* -------------------------------------------------------------------------- */
/*                               Small Helpers                                */
/* -------------------------------------------------------------------------- */

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-violet-400/50 focus:bg-white/[0.06]";

const textareaClassName =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-violet-400/50 focus:bg-white/[0.06]";

const labelClassName = "mb-2 block text-xs font-medium text-white/65";

const emptyEducation = {
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
  description: "",
};

const emptyExperience = {
  company: "",
  role: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
  technologies: [],
};

const emptyProject = {
  title: "",
  description: "",
  technologies: [],
  url: "",
  githubUrl: "",
  startDate: "",
  endDate: "",
};

/* -------------------------------------------------------------------------- */
/*                                  Inputs                                    */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  recommended = "",
}) {
  const length = (value ?? "").length;

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className={labelClassName.replace("mb-2 ", "")}>{label}</label>
        {recommended && (
          <span className="shrink-0 text-[10px] text-white/30">
            {length}/{recommended}
          </span>
        )}
      </div>

      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />

      {hint && (
        <p className="mt-1.5 text-[11px] leading-4 text-white/35">{hint}</p>
      )}
    </div>
  );
}

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  rows = 5,
  className,
}) {
  const textareaRef = useRef(null);

  const resize = () => {
    const element = textareaRef.current;
    if (!element) return;

    // Reset first so deleting text also shrinks the textarea.
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  useEffect(() => {
    resize();
  }, [value]);

  useEffect(() => {
    const handleResize = () => resize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <textarea
      ref={textareaRef}
      value={value ?? ""}
      onChange={(event) => {
        onChange(event.target.value);
        requestAnimationFrame(resize);
      }}
      placeholder={placeholder}
      rows={rows}
      className={className}
      style={{
        overflowY: "hidden",
        resize: "none",
      }}
    />
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  hint,
  recommended = 1000,
}) {
  const text = value ?? "";
  const length = text.length;

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className={labelClassName.replace("mb-2 ", "")}>{label}</label>
        {recommended && (
          <span className="shrink-0 text-[10px] text-white/30">
            {length}/{recommended} recommended
          </span>
        )}
      </div>

      <AutoResizeTextarea
        value={text}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={textareaClassName}
      />

      {hint && (
        <p className="mt-1.5 text-[11px] leading-4 text-white/35">{hint}</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Tag Input                                     */
/* -------------------------------------------------------------------------- */

function TagInput({ label, values = [], onChange, placeholder, hint }) {
  const [input, setInput] = useState("");

  const addValue = (value) => {
    const cleanedValue = value.trim();

    if (!cleanedValue) {
      return;
    }

    const alreadyExists = values.some(
      (item) => item.toLowerCase() === cleanedValue.toLowerCase(),
    );

    if (!alreadyExists) {
      onChange([...values, cleanedValue]);
    }

    setInput("");
  };

  const removeValue = (indexToRemove) => {
    onChange(values.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addValue(input);
    }

    if (event.key === "Backspace" && !input && values.length > 0) {
      removeValue(values.length - 1);
    }
  };

  return (
    <div>
      <label className={labelClassName}>{label}</label>

      <div className="
          w-full rounded-xl border border-white/10 bg-white/[0.04] p-3
          transition focus-within:border-violet-400/50
        ">
        {values.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {values.map((value, index) => (
              <span
                key={`${value}-${index}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-xs text-white/80"
              >
                {value}

                <button
                  type="button"
                  onClick={() => removeValue(index)}
                  className="text-white/35 transition hover:text-red-300"
                  aria-label={`Remove ${value}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (input.trim()) {
              addValue(input);
            }
          }}
          placeholder={placeholder}
          className="w-full bg-transparent px-1 py-1 text-sm text-white outline-none placeholder:text-white/30"
        />
      </div>

      {hint && (
        <p className="mt-1.5 text-[11px] leading-4 text-white/35">{hint}</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Section Wrapper                                 */
/* -------------------------------------------------------------------------- */

function FormSection({ title, description, children, action }) {
  return (
    <section
      className="
        w-full min-w-0
        rounded-2xl
        border border-white/10
        bg-transparent
        p-4
        sm:bg-white/[0.035]
        sm:p-6
      "
    >
      <div className="mb-7 w-full">
        <div className="text-center sm:text-left">
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-white sm:mt-0 sm:text-xl">
            {title}
          </h2>

          {description && (
            <p className="mx-auto mt-1.5 max-w-2xl text-xs leading-5 text-white/40 sm:mx-0">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="mt-4 w-full sm:mt-0 sm:flex sm:justify-end">
            {action}
          </div>
        )}
      </div>

      <div className="w-full min-w-0">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Entry Header                                  */
/* -------------------------------------------------------------------------- */

function EntryHeader({ title, subtitle, onRemove }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-lg font-semibold tracking-[-0.02em] text-white">{title}</p>

        {subtitle && (
          <p className="mt-1 text-xs leading-5 text-white/35">{subtitle}</p>
        )}
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="
            hidden shrink-0 rounded-lg
            border border-red-400/10 bg-red-400/[0.04]
            px-3 py-2 text-xs font-medium text-red-300/80
            transition hover:border-red-400/20 hover:bg-red-400/[0.08]
            sm:block
          "
        >
          Remove
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Resume Form                                   */
/* -------------------------------------------------------------------------- */

export default function ResumeForm({ data, onChange }) {
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

  /* ------------------------------------------------------------------------ */

  const totalSections = 9;
  const completedSections = [
    Boolean(data.profile?.name || data.profile?.email),
    Boolean(data.summary?.trim()),
    (data.experience || []).length > 0,
    (data.projects || []).length > 0,
    (data.education || []).length > 0,
    (data.skills || []).length > 0,
    (data.certifications || []).length > 0,
    (data.achievements || []).length > 0,
    (data.languages || []).length > 0,
  ].filter(Boolean).length;

  return (
    <div className="w-full min-w-0 space-y-5">
      {/* ------------------------------------------------------------------ */}
      {/* Form guidance                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="w-full border-0 bg-transparent px-0 py-2">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-white sm:text-xl">
              Build a complete resume
            </h2>

            <p className="mx-auto mt-2.5 max-w-xl text-xs leading-5 text-white/40 sm:mx-0">
              Start with Profile, Summary, Education, Skills and Projects.
              Add Experience, Certifications, Achievements and Languages when
              they are relevant. Nothing is required if it does not apply to you.
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-center">
            <p className="text-sm font-semibold text-white">
              {completedSections}/{totalSections}
            </p>
            <p className="mt-0.5 text-[10px] text-white/45">sections started</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Profile                                                           */}
      {/* ------------------------------------------------------------------ */}

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
          />

          <Field
            label="Email"
            value={data.profile?.email}
            onChange={(value) => updateProfile("email", value)}
            placeholder="you@example.com"
            type="email"
          />

          <Field
            label="Phone"
            value={data.profile?.phone}
            onChange={(value) => updateProfile("phone", value)}
            placeholder="+91 98765 43210"
            type="tel"
          />

          <Field
            label="Location"
            value={data.profile?.location}
            onChange={(value) => updateProfile("location", value)}
            placeholder="Delhi, India"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="LinkedIn"
            value={data.profile?.linkedIn}
            onChange={(value) => updateProfile("linkedIn", value)}
            placeholder="https://linkedin.com/in/username"
          />

          <Field
            label="GitHub"
            value={data.profile?.github}
            onChange={(value) => updateProfile("github", value)}
            placeholder="https://github.com/username"
          />

          <Field
            label="Portfolio"
            value={data.profile?.portfolio}
            onChange={(value) => updateProfile("portfolio", value)}
            placeholder="https://yourportfolio.com"
          />

          <Field
            label="LeetCode"
            value={data.profile?.leetcode}
            onChange={(value) => updateProfile("leetcode", value)}
            placeholder="https://leetcode.com/username"
            hint="Optional. Add the profile URL only."
          />
        </div>
      </FormSection>

      {/* ------------------------------------------------------------------ */}
      {/* Summary                                                           */}
      {/* ------------------------------------------------------------------ */}

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
          hint="Aim for roughly 80–120 words. Focus on role, strongest skills, experience level and target direction."
        />
      </FormSection>

      {/* ------------------------------------------------------------------ */}
      {/* Experience                                                        */}
      {/* ------------------------------------------------------------------ */}

      <FormSection
        title="Work Experience"
        description="Add your professional experience. Most recent experience should normally come first."
        action={
          <button
            type="button"
            onClick={addExperience}
            className="w-full rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-xs font-medium text-violet-200 transition hover:bg-violet-400/15 sm:w-auto"
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
                w-full min-w-0
                rounded-xl
                border border-white/[0.08]
                bg-transparent
                p-4
                sm:bg-white/[0.02]
                sm:p-5
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
      </FormSection>

      {/* ------------------------------------------------------------------ */}
      {/* Projects                                                          */}
      {/* ------------------------------------------------------------------ */}

      <FormSection
        title="Projects"
        description="Showcase projects that demonstrate your technical skills and impact."
        action={
          <button
            type="button"
            onClick={addProject}
            className="w-full rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-xs font-medium text-violet-200 transition hover:bg-violet-400/15 sm:w-auto"
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
                w-full min-w-0
                rounded-xl
                border border-white/[0.08]
                bg-transparent
                p-4
                sm:bg-white/[0.02]
                sm:p-5
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
      </FormSection>

      {/* ------------------------------------------------------------------ */}
      {/* Education                                                         */}
      {/* ------------------------------------------------------------------ */}

      <FormSection
        title="Education"
        description="Add your academic background."
        action={
          <button
            type="button"
            onClick={addEducation}
            className="w-full rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-xs font-medium text-violet-200 transition hover:bg-violet-400/15 sm:w-auto"
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
                w-full min-w-0
                rounded-xl
                border border-white/[0.08]
                bg-transparent
                p-4
                sm:bg-white/[0.02]
                sm:p-5
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
      </FormSection>

      {/* ------------------------------------------------------------------ */}
      {/* Skills                                                            */}
      {/* ------------------------------------------------------------------ */}

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
      </FormSection>

      {/* ------------------------------------------------------------------ */}
      {/* Certifications                                                    */}
      {/* ------------------------------------------------------------------ */}

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

      {/* ------------------------------------------------------------------ */}
      {/* Achievements                                                      */}
      {/* ------------------------------------------------------------------ */}

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

      {/* ------------------------------------------------------------------ */}
      {/* Languages                                                         */}
      {/* ------------------------------------------------------------------ */}

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
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Empty State                                  */
/* -------------------------------------------------------------------------- */

function EmptyState({ title, description, actionLabel, onClick }) {
  return (
    <div className="w-full rounded-xl border border-dashed border-white/10 bg-white/[0.015] px-4 py-8 text-center sm:px-5">
      <p className="text-sm font-medium text-white/70">{title}</p>

      <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-white/35">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-4 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-medium text-white/75 transition hover:bg-white/[0.08]"
      >
        {actionLabel}
      </button>
    </div>
  );
}
