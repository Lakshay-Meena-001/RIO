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
  - LaTeX-inspired resume structure
  - Large, readable typography
  - Black text on white paper
  - Clear section hierarchy
  - Horizontal rule below every section heading
  - No cards / shadows / modern UI decoration
*/

const pageStyle = {
  width: "210mm",
  minHeight: "297mm",
  padding: "8mm 12mm 9mm 13mm",
  boxSizing: "border-box",
  fontFamily:
    '"Latin Modern Roman", "Computer Modern", "CMU Serif", "Times New Roman", serif',
  fontSize: "10.5pt",
  lineHeight: 1.28,
  color: "#000",
  background: "#fff",
};

const sectionTitleStyle = {
  margin: 0,
  paddingBottom: "2px",
  borderBottom: "1px solid #000",
  fontSize: "13pt",
  lineHeight: 1.05,
  fontWeight: 700,
  letterSpacing: "0.025em",
  textTransform: "uppercase",
  fontVariant: "small-caps",
};

function Section({ title, children, className = "" }) {
  return (
    <section
      className={className}
      style={{
        marginBottom: "9px",
      }}
    >
      <h2 style={sectionTitleStyle}>{title}</h2>

      <div
        style={{
          marginTop: "4px",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }) {
  const cleanItems = (items || []).filter(hasValue);

  if (!cleanItems.length) return null;

  return (
    <ul
      style={{
        margin: "2px 0 0 17px",
        padding: 0,
        listStyleType: "disc",
      }}
    >
      {cleanItems.map((item, index) => (
        <li
          key={index}
          style={{
            paddingLeft: "2px",
            marginBottom: "1px",
            lineHeight: 1.28,
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
        marginBottom: "10px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          columnGap: "20px",
          alignItems: "start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          {hasValue(profile.name) && (
            <h1
              style={{
                margin: 0,
                fontSize: "22pt",
                lineHeight: 1,
                fontWeight: 700,
              }}
            >
              {profile.name}
            </h1>
          )}

          {hasValue(profile.phone) && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "9.8pt",
                lineHeight: 1.2,
              }}
            >
              {profile.phone}
            </p>
          )}

          {hasValue(profile.location) && (
            <p
              style={{
                margin: "1px 0 0",
                fontSize: "9.5pt",
                lineHeight: 1.2,
              }}
            >
              {profile.location}
            </p>
          )}

          {hasValue(profile.portfolio) && (
            <p
              style={{
                margin: "1px 0 0",
                fontSize: "9.5pt",
                lineHeight: 1.2,
              }}
            >
              {profile.portfolio}
            </p>
          )}
        </div>

        <div
          style={{
            minWidth: 0,
            textAlign: "right",
            fontSize: "9.5pt",
            lineHeight: 1.35,
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
          const dateRange = formatDateRange(
            item.startDate,
            item.endDate
          );

          return (
            <div
              key={index}
              className="break-inside-avoid"
              style={{
                marginBottom:
                  index === education.length - 1 ? 0 : "5px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    minWidth: 0,
                    fontSize: "10.5pt",
                  }}
                >
                  {hasValue(item.degree) || hasValue(item.field) ? (
                    <div
                      style={{
                        fontWeight: 700,
                        lineHeight: 1.2,
                      }}
                    >
                      {[item.degree, item.field]
                        .filter(hasValue)
                        .join(" in ")}
                    </div>
                  ) : null}

                  {hasValue(item.institution) && (
                    <div
                      style={{
                        marginTop: "1px",
                        fontStyle: "italic",
                        fontSize: "10pt",
                        lineHeight: 1.2,
                      }}
                    >
                      {item.institution}
                    </div>
                  )}
                </div>

                {hasValue(dateRange) && (
                  <span
                    style={{
                      flexShrink: 0,
                      textAlign: "right",
                      fontSize: "9.2pt",
                      lineHeight: 1.2,
                    }}
                  >
                    {dateRange}
                  </span>
                )}
              </div>

              {hasValue(item.description) && (
                <p
                  style={{
                    margin: "2px 0 0",
                    whiteSpace: "pre-line",
                    fontSize: "10.2pt",
                    lineHeight: 1.27,
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
            style={{
              marginBottom:
                index === projects.length - 1 ? 0 : "6px",
            }}
          >
            {hasValue(project.title) && (
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "10.8pt",
                  lineHeight: 1.2,
                }}
              >
                {project.title}
              </div>
            )}

            {hasValue(project.description) && (
              <div
                style={{
                  marginTop: "1px",
                  fontSize: "10.2pt",
                  lineHeight: 1.27,
                  fontStyle: "italic",
                }}
              >
                {project.description}
              </div>
            )}

            <BulletList
              items={[
                ...(hasItems(project.technologies)
                  ? [
                      `Technology Used: ${project.technologies.join(
                        ", "
                      )}`,
                    ]
                  : []),
              ]}
            />

            {(hasValue(project.url) ||
              hasValue(project.githubUrl)) && (
              <div
                style={{
                  marginTop: "1px",
                  fontSize: "9pt",
                  lineHeight: 1.2,
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
          const dateRange = formatDateRange(
            item.startDate,
            item.endDate
          );

          return (
            <div
              key={index}
              className="break-inside-avoid"
              style={{
                marginBottom:
                  index === experience.length - 1 ? 0 : "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    minWidth: 0,
                    fontSize: "10.7pt",
                    lineHeight: 1.2,
                  }}
                >
                  {hasValue(item.role) && (
                    <span style={{ fontWeight: 700 }}>
                      {item.role}
                    </span>
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
                      fontSize: "9.2pt",
                      lineHeight: 1.2,
                      fontStyle: "italic",
                    }}
                  >
                    {dateRange}
                  </span>
                )}
              </div>

              {hasValue(item.location) && (
                <div
                  style={{
                    marginTop: "1px",
                    fontSize: "9.5pt",
                    lineHeight: 1.2,
                    fontStyle: "italic",
                  }}
                >
                  {item.location}
                </div>
              )}

              {hasValue(item.description) && (
                <div
                  style={{
                    marginTop: "2px",
                    whiteSpace: "pre-line",
                    fontSize: "10.2pt",
                    lineHeight: 1.28,
                  }}
                >
                  <BulletList
                    items={item.description.split(/\n+/)}
                  />
                </div>
              )}

              {hasItems(item.technologies) && (
                <div
                  style={{
                    marginTop: "2px",
                    fontSize: "9.8pt",
                    lineHeight: 1.25,
                  }}
                >
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
      <div
        style={{
          fontSize: "10.3pt",
          lineHeight: 1.3,
        }}
      >
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
          <p
            style={{
              margin: 0,
              fontSize: "10.3pt",
              lineHeight: 1.3,
            }}
          >
            {data.languages.join(", ")}
          </p>
        </Section>
      )}
    </article>
  );
}