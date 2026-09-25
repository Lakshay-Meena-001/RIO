import React from "react";

const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return "";
  if (startDate && endDate) return `${startDate} – ${endDate}`;
  if (startDate) return `${startDate} – Present`;
  return endDate;
};

const hasValue = (value) =>
  typeof value === "string" && value.trim().length > 0;

const hasItems = (value) => Array.isArray(value) && value.length > 0;

/*
  Basic template visual system:
  - A4 page
  - Computer Modern / Latin Modern style serif typography
  - compact LaTeX-like spacing
  - black text on white paper
  - section heading + horizontal rule
  - no cards, no modern UI styling
*/
const pageStyle = {
  width: "210mm",
  minHeight: "297mm",
  padding: "8mm 12mm 10mm 14mm",
  fontFamily:
    '"Latin Modern Roman", "Computer Modern", "CMU Serif", "Times New Roman", serif',
  fontSize: "8.8pt",
  lineHeight: 1.22,
  color: "#000",
  background: "#fff",
};

const sectionTitleStyle = {
  margin: 0,
  paddingBottom: "1px",
  borderBottom: "1px solid #000",
  fontSize: "10.5pt",
  lineHeight: 1.05,
  fontWeight: 700,
  letterSpacing: "0.025em",
  textTransform: "uppercase",
  fontVariant: "small-caps",
};

function Section({ title, children, className = "" }) {
  return (
    <section
      className={`break-inside-avoid ${className}`}
      style={{ marginBottom: "9px" }}
    >
      <h2 style={sectionTitleStyle}>{title}</h2>
      <div style={{ marginTop: "4px" }}>{children}</div>
    </section>
  );
}

function BulletList({ items }) {
  const cleanItems = (items || []).filter(hasValue);
  if (!cleanItems.length) return null;

  return (
    <ul
      style={{
        margin: "1px 0 0 14px",
        padding: 0,
        listStyleType: "disc",
      }}
    >
      {cleanItems.map((item, index) => (
        <li
          key={index}
          style={{
            paddingLeft: "1px",
            marginBottom: "0.5px",
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function Header({ profile }) {
  return (
    <header
      className="break-inside-avoid"
      style={{
        marginBottom: "7px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          columnGap: "16px",
          alignItems: "start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          {hasValue(profile.name) && (
            <h1
              style={{
                margin: 0,
                fontSize: "16.5pt",
                lineHeight: 1,
                fontWeight: 700,
              }}
            >
              {profile.name}
            </h1>
          )}

          {hasValue(profile.phone) && (
            <p style={{ margin: "2px 0 0", fontSize: "8.2pt" }}>
              {profile.phone}
            </p>
          )}

          {hasValue(profile.location) && (
            <p style={{ margin: "0.5px 0 0", fontSize: "8.2pt" }}>
              {profile.location}
            </p>
          )}

          {hasValue(profile.portfolio) && (
            <p style={{ margin: "0.5px 0 0", fontSize: "8.2pt" }}>
              {profile.portfolio}
            </p>
          )}
        </div>

        <div
          style={{
            minWidth: 0,
            textAlign: "right",
            fontSize: "8.2pt",
            lineHeight: 1.25,
          }}
        >
          {hasValue(profile.email) && <div>{profile.email}</div>}
          {hasValue(profile.github) && <div>{profile.github}</div>}
          {hasValue(profile.linkedIn) && <div>{profile.linkedIn}</div>}
          {hasValue(profile.leetcode) && <div>{profile.leetcode}</div>}
        </div>
      </div>
    </header>
  );
}

function EducationSection({ education }) {
  if (!hasItems(education)) return null;

  return (
    <Section title="Education">
      <div>
        {education.map((item, index) => {
          const dateRange = formatDateRange(item.startDate, item.endDate);

          return (
            <div
              key={index}
              className="break-inside-avoid"
              style={{ marginBottom: index === education.length - 1 ? 0 : "3px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "12px",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  {hasValue(item.degree) || hasValue(item.field) ? (
                    <div style={{ fontWeight: 700 }}>
                      {[item.degree, item.field]
                        .filter(hasValue)
                        .join(" in ")}
                    </div>
                  ) : null}

                  {hasValue(item.institution) && (
                    <div style={{ fontStyle: "italic", fontSize: "8.2pt" }}>
                      {item.institution}
                    </div>
                  )}
                </div>

                {hasValue(dateRange) && (
                  <span
                    style={{
                      flexShrink: 0,
                      textAlign: "right",
                      fontSize: "8pt",
                    }}
                  >
                    {dateRange}
                  </span>
                )}
              </div>

              {hasValue(item.description) && (
                <p
                  style={{
                    margin: "1px 0 0",
                    whiteSpace: "pre-line",
                    fontSize: "8.2pt",
                  }}
                >
                  {item.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function ProjectsSection({ projects }) {
  if (!hasItems(projects)) return null;

  return (
    <Section title="Personal Projects">
      <div>
        {projects.map((project, index) => (
          <div
            key={index}
            className="break-inside-avoid"
            style={{ marginBottom: index === projects.length - 1 ? 0 : "4px" }}
          >
            <div style={{ fontWeight: 700 }}>
              {hasValue(project.title) && project.title}
            </div>

            {hasValue(project.description) && (
              <div
                style={{
                  marginTop: "0.5px",
                  fontSize: "8.2pt",
                  fontStyle: "italic",
                }}
              >
                {project.description}
              </div>
            )}

            <BulletList
              items={[
                ...(hasItems(project.technologies)
                  ? [`Technology Used: ${project.technologies.join(", ")}`]
                  : []),
              ]}
            />

            {(hasValue(project.url) || hasValue(project.githubUrl)) && (
              <div
                style={{
                  marginTop: "0.5px",
                  fontSize: "7.7pt",
                }}
              >
                {[project.url, project.githubUrl]
                  .filter(hasValue)
                  .join("  |  ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

function ExperienceSection({ experience }) {
  if (!hasItems(experience)) return null;

  return (
    <Section title="Experience">
      <div>
        {experience.map((item, index) => {
          const dateRange = formatDateRange(item.startDate, item.endDate);

          return (
            <div
              key={index}
              className="break-inside-avoid"
              style={{ marginBottom: index === experience.length - 1 ? 0 : "4px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "12px",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  {hasValue(item.role) && (
                    <span style={{ fontWeight: 700 }}>{item.role}</span>
                  )}
                  {hasValue(item.company) && (
                    <span>
                      {hasValue(item.role) ? " — " : ""}
                      {item.company}
                    </span>
                  )}
                </div>

                {hasValue(dateRange) && (
                  <span
                    style={{
                      flexShrink: 0,
                      textAlign: "right",
                      fontSize: "8pt",
                      fontStyle: "italic",
                    }}
                  >
                    {dateRange}
                  </span>
                )}
              </div>

              {hasValue(item.location) && (
                <div style={{ fontSize: "8pt", fontStyle: "italic" }}>
                  {item.location}
                </div>
              )}

              {hasValue(item.description) && (
                <div style={{ marginTop: "1px", whiteSpace: "pre-line" }}>
                  <BulletList items={item.description.split(/\n+/)} />
                </div>
              )}

              {hasItems(item.technologies) && (
                <div style={{ marginTop: "1px", fontSize: "8pt" }}>
                  <strong>Technologies Used:</strong>{" "}
                  {item.technologies.join(", ")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function SkillsSection({ skills }) {
  if (!hasItems(skills)) return null;

  return (
    <Section title="Technical Skills and Interests">
      <div style={{ fontSize: "8.2pt", lineHeight: 1.2 }}>
        <div>
          <strong>Skills:</strong> {skills.join(", ")}
        </div>
      </div>
    </Section>
  );
}

export default function BasicTemplate({ data }) {
  const profile = data?.profile || {};
  const education = data?.education || [];
  const experience = data?.experience || [];
  const projects = data?.projects || [];
  const skills = data?.skills || [];

  return (
    <article
      className="resume-page mx-auto bg-white text-black"
      style={pageStyle}
    >
      <Header profile={profile} />

      {/* The supplied LaTeX template uses this compact order. */}
      <EducationSection education={education} />
      <ProjectsSection projects={projects} />
      <ExperienceSection experience={experience} />
      <SkillsSection skills={skills} />

      {hasItems(data?.certifications) && (
        <Section title="Certifications">
          <BulletList items={data.certifications} />
        </Section>
      )}

      {hasItems(data?.achievements) && (
        <Section title="Achievements">
          <BulletList items={data.achievements} />
        </Section>
      )}

      {hasItems(data?.languages) && (
        <Section title="Languages">
          <p style={{ margin: 0 }}>{data.languages.join(", ")}</p>
        </Section>
      )}
    </article>
  );
}
