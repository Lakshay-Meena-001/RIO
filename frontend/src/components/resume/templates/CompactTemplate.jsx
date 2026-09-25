import React from "react";

const hasValue = (value) =>
  typeof value === "string" && value.trim().length > 0;

const hasItems = (value) => Array.isArray(value) && value.length > 0;

const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return "";

  if (startDate && endDate) {
    return `${startDate} – ${endDate}`;
  }

  return startDate ? `${startDate} – Present` : endDate;
};

function Section({ title, children }) {
  return (
    <section className="mb-3.5 break-inside-avoid">
      <h2 className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.12em] text-neutral-900">
        {title}
      </h2>

      <div className="mb-2 h-px bg-neutral-800" />

      {children}
    </section>
  );
}

function CompactEntry({
  title,
  subtitle,
  location,
  dateRange,
  description,
  technologies,
}) {
  return (
    <div className="break-inside-avoid">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {hasValue(title) && (
            <h3 className="text-[8.5px] font-bold">{title}</h3>
          )}

          {hasValue(subtitle) && (
            <p className="text-[8px] text-neutral-700">{subtitle}</p>
          )}

          {hasValue(location) && (
            <span className="text-[7px] italic text-neutral-500">
              {location}
            </span>
          )}
        </div>

        {hasValue(dateRange) && (
          <span className="shrink-0 text-[7px] text-neutral-500">
            {dateRange}
          </span>
        )}
      </div>

      {hasValue(description) && (
        <p className="mt-1 whitespace-pre-line text-[7.8px] leading-[1.38] text-neutral-800">
          {description}
        </p>
      )}

      {hasItems(technologies) && (
        <p className="mt-0.5 text-[7px] text-neutral-500">
          <span className="font-semibold">Tech:</span> {technologies.join(", ")}
        </p>
      )}
    </div>
  );
}

export default function CompactTemplate({ data }) {
  const profile = data?.profile || {};

  const education = data?.education || [];
  const experience = data?.experience || [];
  const projects = data?.projects || [];

  return (
    <article
      className="resume-page mx-auto bg-white text-neutral-900"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "10mm 12mm",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "8pt",
        lineHeight: 1.32,
      }}
    >
      {/* ================================================================ */}
      {/* HEADER                                                           */}
      {/* ================================================================ */}

      <header className="mb-3.5 border-b-2 border-neutral-900 pb-2.5">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            {hasValue(profile.name) && (
              <h1 className="text-[19px] font-bold leading-none tracking-[-0.015em]">
                {profile.name}
              </h1>
            )}

            {hasValue(data?.summary) && (
              <p className="mt-1.5 max-w-[135mm] text-[7.8px] leading-[1.4] text-neutral-700">
                {data.summary}
              </p>
            )}
          </div>

          <div className="shrink-0 text-right text-[7px] leading-[1.6] text-neutral-600">
            {hasValue(profile.email) && <div>{profile.email}</div>}

            {hasValue(profile.phone) && <div>{profile.phone}</div>}

            {hasValue(profile.location) && <div>{profile.location}</div>}
          </div>
        </div>

        <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[7px] text-neutral-600">
          {hasValue(profile.linkedIn) && <span>{profile.linkedIn}</span>}

          {hasValue(profile.github) && <span>{profile.github}</span>}

          {hasValue(profile.portfolio) && <span>{profile.portfolio}</span>}

          {hasValue(profile.leetcode) && <span>{profile.leetcode}</span>}
        </div>
      </header>

      {/* ================================================================ */}
      {/* EXPERIENCE — PRIMARY                                             */}
      {/* ================================================================ */}

      {hasItems(experience) && (
        <Section title="Work Experience">
          <div className="space-y-3">
            {experience.map((item, index) => (
              <CompactEntry
                key={index}
                title={item.role}
                subtitle={item.company}
                location={item.location}
                dateRange={formatDateRange(item.startDate, item.endDate)}
                description={item.description}
                technologies={item.technologies}
              />
            ))}
          </div>
        </Section>
      )}

      {/* ================================================================ */}
      {/* PROJECTS                                                         */}
      {/* ================================================================ */}

      {hasItems(projects) && (
        <Section title="Selected Projects">
          <div className="space-y-3">
            {projects.map((project, index) => (
              <CompactEntry
                key={index}
                title={project.title}
                subtitle={
                  hasItems(project.technologies)
                    ? project.technologies.join(" · ")
                    : ""
                }
                dateRange={formatDateRange(project.startDate, project.endDate)}
                description={project.description}
              />
            ))}
          </div>
        </Section>
      )}

      {/* ================================================================ */}
      {/* EDUCATION                                                        */}
      {/* ================================================================ */}

      {hasItems(education) && (
        <Section title="Education">
          <div className="space-y-2.5">
            {education.map((item, index) => (
              <div key={index} className="break-inside-avoid">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {hasValue(item.institution) && (
                      <h3 className="text-[8.5px] font-bold">
                        {item.institution}
                      </h3>
                    )}

                    {(hasValue(item.degree) || hasValue(item.field)) && (
                      <p className="text-[7.8px]">
                        {[item.degree, item.field].filter(hasValue).join(" · ")}
                      </p>
                    )}
                  </div>

                  {hasValue(formatDateRange(item.startDate, item.endDate)) && (
                    <span className="shrink-0 text-[7px] text-neutral-500">
                      {formatDateRange(item.startDate, item.endDate)}
                    </span>
                  )}
                </div>

                {hasValue(item.description) && (
                  <p className="mt-0.5 whitespace-pre-line text-[7.5px]">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ================================================================ */}
      {/* SKILLS                                                           */}
      {/* ================================================================ */}

      {hasItems(data?.skills) && (
        <Section title="Technical Skills">
          <p className="text-[7.8px] leading-[1.45]">
            {data.skills.join("  •  ")}
          </p>
        </Section>
      )}

      {/* ================================================================ */}
      {/* CERTIFICATIONS                                                   */}
      {/* ================================================================ */}

      {hasItems(data?.certifications) && (
        <Section title="Certifications">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            {data.certifications.map((item, index) => (
              <div key={index} className="break-inside-avoid text-[7.5px]">
                • {item}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ================================================================ */}
      {/* ACHIEVEMENTS / HONORS                                            */}
      {/* ================================================================ */}

      {hasItems(data?.achievements) && (
        <Section title="Honors & Achievements">
          <ul className="ml-3 space-y-0.5 text-[7.5px]">
            {data.achievements.map((item, index) => (
              <li key={index} className="break-inside-avoid">
                • {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ================================================================ */}
      {/* LANGUAGES                                                        */}
      {/* ================================================================ */}

      {hasItems(data?.languages) && (
        <Section title="Languages">
          <p className="text-[7.5px]">{data.languages.join(" • ")}</p>
        </Section>
      )}
    </article>
  );
}
