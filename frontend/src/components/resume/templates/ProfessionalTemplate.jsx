import React from "react";

const toArray = (value) => (Array.isArray(value) ? value : []);

const valueText = (value) => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value.name || value.title || value.value || value.description || "";
};

const range = (start, end) => {
  if (!start && !end) return "";
  if (start && end) return `${start} – ${end}`;
  return start || end || "";
};

const href = (value) =>
  value ? (/^https?:\/\//i.test(value) ? value : `https://${value}`) : "";

const shortUrl = (value) =>
  String(value || "").replace(/^https?:\/\//i, "").replace(/\/$/, "");

const descriptionItems = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(valueText).filter(Boolean);

  const text = String(value).trim();

  // Treat explicit bullet/newline descriptions as separate Deedy bullets.
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);

  return lines.length ? lines : [text];
};

function Section({ title, children }) {
  return (
    <section className="pro-section">
      <h2 className="pro-section-title">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function BulletList({ items }) {
  const values = toArray(items).filter(Boolean);
  if (!values.length) return null;

  return (
    <ul className="pro-bullets">
      {values.map((item, index) => (
        <li key={index}>{valueText(item)}</li>
      ))}
    </ul>
  );
}

export default function ProfessionalTemplate({ data = {} }) {
  const resume = data || {};
  const profile = resume.profile || {};

  const education = toArray(resume.education);
  const experience = toArray(resume.experience);
  const projects = toArray(resume.projects);
  const skills = toArray(resume.skills);
  const certifications = toArray(resume.certifications);
  const achievements = toArray(resume.achievements);
  const languages = toArray(resume.languages);

  const links = [
    profile.github && {
      label: "Github://",
      value: shortUrl(profile.github),
      url: href(profile.github),
    },
    profile.linkedIn && {
      label: "LinkedIn://",
      value: shortUrl(profile.linkedIn),
      url: href(profile.linkedIn),
    },
    profile.portfolio && {
      label: "Portfolio://",
      value: shortUrl(profile.portfolio),
      url: href(profile.portfolio),
    },
    profile.leetcode && {
      label: "LeetCode://",
      value: shortUrl(profile.leetcode),
      url: href(profile.leetcode),
    },
  ].filter(Boolean);

  const skillGroups =
    skills.length && typeof skills[0] === "object"
      ? skills
          .map((skill) => ({
            label:
              skill.category ||
              skill.type ||
              skill.name ||
              skill.title ||
              "Skills",
            values: toArray(skill.skills || skill.items).length
              ? toArray(skill.skills || skill.items)
              : skill.value
              ? [skill.value]
              : [],
          }))
          .filter((group) => group.values.length)
      : skills.length
      ? [{ label: "Programming", values: skills }]
      : [];

  const parts = String(profile.name || "Your Name")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const firstName =
    parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0] || "Your";
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "";

  const formattedUpdatedDate = resume.updatedAt
    ? new Date(resume.updatedAt).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="professional-template">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Raleway:wght@300;400;500;600;700&display=swap');

        .professional-template {
          width: 210mm;
          min-height: 297mm;
          margin: 0;
          padding: 7.5mm 12.5mm 9mm;
          box-sizing: border-box;
          background: #fff;
          color: #2b2b2b;
          font-family: "Lato", Arial, sans-serif;
          font-size: 9.2pt;
          line-height: 1.2;
        }

        .professional-template *,
        .professional-template *::before,
        .professional-template *::after {
          box-sizing: border-box;
        }

        /* ---------------- HEADER ---------------- */

        .pro-header {
          position: relative;
          text-align: center;
          padding-bottom: 5.5mm;
          margin-bottom: 3.5mm;
        }

        .pro-last-updated {
          position: absolute;
          top: -1.5mm;
          right: 0;
          color: #666;
          font-family: "Raleway", Arial, sans-serif;
          font-size: 6.8pt;
          font-weight: 400;
          white-space: nowrap;
        }

        .pro-name {
          margin: 0;
          color: #2b2b2b;
          font-family: "Lato", Arial, sans-serif;
          font-size: 40pt;
          line-height: .88;
          font-weight: 300;
          letter-spacing: -1px;
        }

        .pro-name-first {
          font-weight: 300;
        }

        .pro-name-last {
          font-weight: 400;
        }

        .pro-contact {
          margin-top: 2.4mm;
          color: #333;
          font-family: "Raleway", Arial, sans-serif;
          font-size: 8.8pt;
          line-height: 1.15;
          font-weight: 500;
        }

        .pro-contact a {
          color: #333;
          text-decoration: none;
        }

        .pro-rule {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          border-top: .45pt solid #777;
        }

        /* ---------------- GRID ---------------- */

        .pro-grid {
          display: grid;
          grid-template-columns: 33% 65%;
          column-gap: 2%;
          align-items: start;
        }

        .pro-column {
          min-width: 0;
        }

        /* ---------------- SECTION ---------------- */

        .pro-section {
          margin: 0 0 6.5mm;
        }

        .pro-section-title {
          margin: 0 0 2mm;
          color: #6a6a6a;
          font-family: "Lato", Arial, sans-serif;
          font-size: 15.5pt;
          line-height: .95;
          font-weight: 300;
          letter-spacing: .1px;
          text-transform: uppercase;
        }

        /* ---------------- LEFT ---------------- */

        .pro-left-entry {
          margin: 0 0 4.5mm;
        }

        .pro-school,
        .pro-left-title {
          color: #333;
          font-family: "Lato", Arial, sans-serif;
          font-size: 10.5pt;
          line-height: 1.04;
          font-weight: 700;
          text-transform: uppercase;
        }

        .pro-degree {
          margin-top: 1mm;
          color: #333;
          font-family: "Raleway", Arial, sans-serif;
          font-size: 8.6pt;
          line-height: 1.05;
          font-weight: 500;
          text-transform: uppercase;
        }

        .pro-location {
          margin-top: .9mm;
          color: #666;
          font-family: "Raleway", Arial, sans-serif;
          font-size: 8.1pt;
          line-height: 1.05;
          font-weight: 500;
        }

        .pro-left-body {
          margin-top: 1.5mm;
          color: #2b2b2b;
          font-size: 8.4pt;
          line-height: 1.2;
          font-weight: 300;
        }

        /* ---------------- LINKS ---------------- */

        .pro-links {
          color: #333;
          font-family: "Raleway", Arial, sans-serif;
          font-size: 8.2pt;
          line-height: 1.4;
          font-weight: 400;
        }

        .pro-link {
          margin: 0;
          overflow-wrap: anywhere;
        }

        .pro-link-label {
          font-weight: 700;
        }

        .pro-links a {
          color: #333;
          text-decoration: none;
        }

        /* ---------------- SKILLS ---------------- */

        .pro-skill {
          margin-bottom: 3.3mm;
        }

        .pro-skill-label {
          margin-bottom: .9mm;
          color: #333;
          font-family: "Raleway", Arial, sans-serif;
          font-size: 9pt;
          line-height: 1;
          font-weight: 700;
          text-transform: uppercase;
        }

        .pro-skill-values {
          color: #2b2b2b;
          font-size: 8.4pt;
          line-height: 1.22;
          font-weight: 300;
        }

        /* ---------------- RIGHT ENTRIES ---------------- */

        .pro-entry {
          margin-bottom: 5mm;
        }

        .pro-entry-head {
          position: relative;
          padding-right: 32mm;
        }

        .pro-entry-title {
          color: #333;
          font-family: "Lato", Arial, sans-serif;
          font-size: 11.5pt;
          line-height: 1.02;
          font-weight: 700;
          text-transform: uppercase;
        }

        .pro-entry-role {
          margin-top: 1mm;
          color: #333;
          font-family: "Raleway", Arial, sans-serif;
          font-size: 8.7pt;
          line-height: 1.05;
          font-weight: 500;
          text-transform: uppercase;
          font-variant: small-caps;
        }

        .pro-entry-date {
          position: absolute;
          top: 0;
          right: 0;
          color: #666;
          font-family: "Raleway", Arial, sans-serif;
          font-size: 7.7pt;
          line-height: 1.05;
          font-weight: 400;
          text-align: right;
          white-space: nowrap;
        }

        .pro-entry-location {
          margin-top: .9mm;
          color: #666;
          font-family: "Raleway", Arial, sans-serif;
          font-size: 8pt;
          line-height: 1.05;
          font-weight: 500;
        }

        .pro-bullets {
          margin: 1.7mm 0 0;
          padding-left: 5mm;
          color: #2b2b2b;
          font-size: 8.5pt;
          line-height: 1.22;
          font-weight: 300;
        }

        .pro-bullets li {
          margin: 0 0 1.15mm;
          padding-left: .4mm;
        }

        .pro-body {
          margin-top: 1.6mm;
          color: #2b2b2b;
          font-size: 8.5pt;
          line-height: 1.22;
          font-weight: 300;
        }

        .pro-tech {
          margin-top: 1.2mm;
          color: #666;
          font-family: "Raleway", Arial, sans-serif;
          font-size: 7.8pt;
          line-height: 1.1;
          font-style: italic;
          font-weight: 400;
        }

        /* ---------------- PROJECTS ---------------- */

        .pro-project {
          margin-bottom: 4.8mm;
        }

        .pro-project-head {
          position: relative;
          padding-right: 32mm;
        }

        .pro-project-title {
          color: #333;
          font-family: "Lato", Arial, sans-serif;
          font-size: 11.5pt;
          line-height: 1.02;
          font-weight: 700;
          text-transform: uppercase;
        }

        .pro-project-date {
          position: absolute;
          top: 0;
          right: 0;
          color: #666;
          font-family: "Raleway", Arial, sans-serif;
          font-size: 7.7pt;
          line-height: 1.05;
          white-space: nowrap;
        }

        @media print {
          .professional-template {
            width: 210mm !important;
            min-height: 297mm !important;
          }
        }
      `}</style>

      <header className="pro-header">
        {formattedUpdatedDate && (
          <div className="pro-last-updated">
            Last Updated on {formattedUpdatedDate}
          </div>
        )}

        <h1 className="pro-name">
          <span className="pro-name-first">{firstName}</span>
          {lastName && (
            <>
              {" "}
              <span className="pro-name-last">{lastName}</span>
            </>
          )}
        </h1>

        <div className="pro-contact">
          {profile.email && (
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          )}
          {profile.phone && <> | {profile.phone}</>}
          {profile.location && <> | {profile.location}</>}
        </div>

        <div className="pro-rule" />
      </header>

      <main className="pro-grid">
        {/* LEFT COLUMN */}
        <aside className="pro-column">
          {education.length > 0 && (
            <Section title="Education">
              {education.map((item, index) => (
                <div className="pro-left-entry" key={index}>
                  {item.institution && (
                    <div className="pro-school">{item.institution}</div>
                  )}

                  {(item.degree || item.field) && (
                    <div className="pro-degree">
                      {[item.degree, item.field].filter(Boolean).join(" in ")}
                    </div>
                  )}

                  {(item.startDate ||
                    item.endDate ||
                    item.location) && (
                    <div className="pro-location">
                      {[range(item.startDate, item.endDate), item.location]
                        .filter(Boolean)
                        .join(" | ")}
                    </div>
                  )}

                  {item.description && (
                    <div className="pro-left-body">{item.description}</div>
                  )}
                </div>
              ))}
            </Section>
          )}

          {links.length > 0 && (
            <Section title="Links">
              <div className="pro-links">
                {links.map((link) => (
                  <div className="pro-link" key={link.label}>
                    <span className="pro-link-label">{link.label}</span>{" "}
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.value}
                    </a>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {skillGroups.length > 0 && (
            <Section title="Skills">
              {skillGroups.map((group, index) => (
                <div className="pro-skill" key={index}>
                  <div className="pro-skill-label">{group.label}</div>
                  <div className="pro-skill-values">
                    {group.values.map(valueText).join(" • ")}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {certifications.length > 0 && (
            <Section title="Certifications">
              <BulletList items={certifications} />
            </Section>
          )}

          {languages.length > 0 && (
            <Section title="Languages">
              <div className="pro-skill-values">
                {languages.map(valueText).join(" • ")}
              </div>
            </Section>
          )}
        </aside>

        {/* RIGHT COLUMN */}
        <section className="pro-column">
          {experience.length > 0 && (
            <Section title="Experience">
              {experience.map((item, index) => (
                <article className="pro-entry" key={index}>
                  <div className="pro-entry-head">
                    <div className="pro-entry-title">
                      {item.company || "Experience"}
                    </div>

                    {item.role && (
                      <div className="pro-entry-role">{item.role}</div>
                    )}

                    {(item.startDate || item.endDate) && (
                      <div className="pro-entry-date">
                        {range(item.startDate, item.endDate)}
                      </div>
                    )}
                  </div>

                  {item.location && (
                    <div className="pro-entry-location">{item.location}</div>
                  )}

                  <BulletList items={descriptionItems(item.description)} />

                  {toArray(item.technologies).length > 0 && (
                    <div className="pro-tech">
                      Technologies:{" "}
                      {toArray(item.technologies).map(valueText).join(" • ")}
                    </div>
                  )}
                </article>
              ))}
            </Section>
          )}

          {projects.length > 0 && (
            <Section title="Projects">
              {projects.map((item, index) => (
                <article className="pro-project" key={index}>
                  <div className="pro-project-head">
                    <div className="pro-project-title">
                      {item.title || "Project"}
                    </div>

                    {(item.startDate || item.endDate) && (
                      <div className="pro-project-date">
                        {range(item.startDate, item.endDate)}
                      </div>
                    )}
                  </div>

                  {item.description && (
                    <div className="pro-body">{item.description}</div>
                  )}

                  {toArray(item.technologies).length > 0 && (
                    <div className="pro-tech">
                      {toArray(item.technologies).map(valueText).join(" • ")}
                    </div>
                  )}
                </article>
              ))}
            </Section>
          )}

          {achievements.length > 0 && (
            <Section title="Achievements">
              <BulletList items={achievements} />
            </Section>
          )}
        </section>
      </main>
    </div>
  );
}
