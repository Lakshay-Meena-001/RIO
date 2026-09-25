import React from "react";

/*
  RIO Modern Resume Template
  ------------------------------------------------------------
  This is an independent React/CSS implementation inspired by
  the visual/typographic system documented in Awesome-CV.

  Font system:
  - Header: Roboto
  - Body/content: Source Sans 3

  The implementation does NOT copy Awesome-CV's LaTeX class/macros.
*/

const ACCENT = "#DC3522";
const TEXT = "#333333";
const DARK_TEXT = "#414141";
const GRAY = "#5D5D5D";
const LIGHT_GRAY = "#999999";
const DIVIDER = "#5D5D5D";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');
`;

function safe(value) {
  return value == null ? "" : String(value);
}

function joinNonEmpty(values, separator = " • ") {
  return values.map(safe).filter(Boolean).join(separator);
}

function splitName(name) {
  const value = safe(name).trim();
  if (!value) return { first: "", last: "" };

  const parts = value.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };

  return {
    first: parts.slice(0, -1).join(" "),
    last: parts[parts.length - 1],
  };
}

function formatDateRange(start, end) {
  const s = safe(start);
  const e = safe(end);

  if (!s && !e) return "";
  if (s && !e) return s;
  if (!s && e) return e;
  return `${s} – ${e}`;
}

function normalizeUrl(value) {
  const url = safe(value).trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function IconText({ icon, children, href }) {
  if (!children) return null;

  const content = (
    <span className="rio-modern-social-item">
      <span className="rio-modern-social-icon" aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
    </span>
  );

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rio-modern-link"
    >
      {content}
    </a>
  ) : (
    content
  );
}

function Header({ profile, summary }) {
  const { first, last } = splitName(profile?.name);

  const socials = [
    profile?.phone
      ? { icon: "☎", value: profile.phone, href: `tel:${profile.phone}` }
      : null,
    profile?.email
      ? { icon: "✉", value: profile.email, href: `mailto:${profile.email}` }
      : null,
    profile?.portfolio
      ? {
          icon: "⌂",
          value: profile.portfolio,
          href: normalizeUrl(profile.portfolio),
        }
      : null,
    profile?.github
      ? {
          icon: "◈",
          value: profile.github,
          href: normalizeUrl(
            profile.github.startsWith("http")
              ? profile.github
              : `github.com/${profile.github.replace(/^@/, "")}`
          ),
        }
      : null,
    profile?.linkedin
      ? {
          icon: "in",
          value: profile.linkedin,
          href: normalizeUrl(
            profile.linkedin.startsWith("http")
              ? profile.linkedin
              : `linkedin.com/in/${profile.linkedin.replace(/^@/, "")}`
          ),
        }
      : null,
    profile?.leetcode
      ? {
          icon: "LC",
          value: profile.leetcode,
          href: normalizeUrl(profile.leetcode),
        }
      : null,
  ].filter(Boolean);

  // Do not fabricate a job title. Use the first experience role only when
  // the resume data actually contains one.
  const position = safe(profile?.position);

  return (
    <header className="rio-modern-header">
      <div className="rio-modern-name">
        <span className="rio-modern-first-name">{first}</span>
        {last ? <span className="rio-modern-last-name"> {last}</span> : null}
      </div>

      {position ? (
        <div className="rio-modern-position">{position}</div>
      ) : null}

      {profile?.location ? (
        <div className="rio-modern-address">{profile.location}</div>
      ) : null}

      {socials.length > 0 ? (
        <div className="rio-modern-social-row">
          {socials.map((item, index) => (
            <React.Fragment key={`${item.value}-${index}`}>
              {index > 0 ? (
                <span className="rio-modern-social-separator" aria-hidden="true">
                  |
                </span>
              ) : null}
              <IconText icon={item.icon} href={item.href}>
                {item.value}
              </IconText>
            </React.Fragment>
          ))}
        </div>
      ) : null}
    </header>
  );
}

function Section({ title, children }) {
  if (!children) return null;

  return (
    <section className="rio-modern-section">
      <div className="rio-modern-section-heading">
        <h2>{title}</h2>
        <span className="rio-modern-section-rule" aria-hidden="true" />
      </div>
      <div className="rio-modern-section-content">{children}</div>
    </section>
  );
}

function ExperienceEntry({ item }) {
  if (!item) return null;

  const company = safe(item.company);
  const role = safe(item.role);
  const location = safe(item.location);
  const dates = formatDateRange(item.startDate, item.endDate);

  return (
    <article className="rio-modern-entry">
      <div className="rio-modern-entry-top">
        <div className="rio-modern-entry-left">
          {company ? <div className="rio-modern-entry-title">{company}</div> : null}
          {role ? <div className="rio-modern-entry-position">{role}</div> : null}
        </div>

        <div className="rio-modern-entry-right">
          {location ? (
            <div className="rio-modern-entry-location">{location}</div>
          ) : null}
          {dates ? <div className="rio-modern-entry-date">{dates}</div> : null}
        </div>
      </div>

      {item.description ? (
        <div className="rio-modern-description">
          {safe(item.description)
            .split(/\n+/)
            .filter(Boolean)
            .map((line, index) => (
              <div className="rio-modern-bullet" key={index}>
                <span aria-hidden="true">•</span>
                <span>{line.replace(/^[•*-]\s*/, "")}</span>
              </div>
            ))}
        </div>
      ) : null}
    </article>
  );
}

function ProjectEntry({ item }) {
  if (!item) return null;

  const title = safe(item.title);
  const dates = formatDateRange(item.startDate, item.endDate);
  const technologies = Array.isArray(item.technologies)
    ? item.technologies.filter(Boolean).join(", ")
    : safe(item.technologies);

  const links = [
    item.githubUrl ? { label: "GitHub", url: item.githubUrl } : null,
    item.url ? { label: "Link", url: item.url } : null,
  ].filter(Boolean);

  return (
    <article className="rio-modern-entry">
      <div className="rio-modern-entry-top">
        <div className="rio-modern-entry-left">
          {title ? <div className="rio-modern-entry-title">{title}</div> : null}
          {technologies ? (
            <div className="rio-modern-entry-position">{technologies}</div>
          ) : null}
        </div>

        <div className="rio-modern-entry-right">
          {dates ? <div className="rio-modern-entry-date">{dates}</div> : null}
          {links.length > 0 ? (
            <div className="rio-modern-project-links">
              {links.map((link, index) => (
                <React.Fragment key={link.label}>
                  {index > 0 ? " · " : ""}
                  <a
                    href={normalizeUrl(link.url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </a>
                </React.Fragment>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {item.description ? (
        <div className="rio-modern-description">
          {safe(item.description)
            .split(/\n+/)
            .filter(Boolean)
            .map((line, index) => (
              <div className="rio-modern-bullet" key={index}>
                <span aria-hidden="true">•</span>
                <span>{line.replace(/^[•*-]\s*/, "")}</span>
              </div>
            ))}
        </div>
      ) : null}
    </article>
  );
}

function EducationEntry({ item }) {
  if (!item) return null;

  const degree = joinNonEmpty([item.degree, item.field], " in ");
  const dates = formatDateRange(item.startDate, item.endDate);

  return (
    <article className="rio-modern-entry">
      <div className="rio-modern-entry-top">
        <div className="rio-modern-entry-left">
          {item.institution ? (
            <div className="rio-modern-entry-title">{item.institution}</div>
          ) : null}
          {degree ? (
            <div className="rio-modern-entry-position">{degree}</div>
          ) : null}
        </div>

        <div className="rio-modern-entry-right">
          {item.location ? (
            <div className="rio-modern-entry-location">{item.location}</div>
          ) : null}
          {dates ? <div className="rio-modern-entry-date">{dates}</div> : null}
        </div>
      </div>

      {item.description ? (
        <div className="rio-modern-description">{item.description}</div>
      ) : null}
    </article>
  );
}

function SkillsSection({ skills }) {
  if (!Array.isArray(skills) || skills.length === 0) return null;

  const values = skills
    .map((skill) => {
      if (typeof skill === "string") return skill;
      if (skill?.name) return skill.name;
      if (skill?.skill) return skill.skill;
      return "";
    })
    .filter(Boolean);

  if (!values.length) return null;

  return (
    <div className="rio-modern-skills-row">
      <div className="rio-modern-skill-label">Skills</div>
      <div className="rio-modern-skill-value">{values.join(", ")}</div>
    </div>
  );
}

function SimpleListSection({ items, className = "" }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const values = items
    .map((item) => {
      if (typeof item === "string") return item;
      if (item?.name) return item.name;
      if (item?.title) return item.title;
      if (item?.description) return item.description;
      return "";
    })
    .filter(Boolean);

  if (!values.length) return null;

  return (
    <div className={`rio-modern-simple-list ${className}`}>
      {values.map((value, index) => (
        <div className="rio-modern-bullet" key={index}>
          <span aria-hidden="true">•</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ModernTemplate({ data = {} }) {
  const resume = data || {};
  const profile = resume.profile || {};

  const experience = Array.isArray(resume.experience)
    ? resume.experience
    : [];
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  const education = Array.isArray(resume.education) ? resume.education : [];

  const certifications = Array.isArray(resume.certifications)
    ? resume.certifications
    : [];
  const achievements = Array.isArray(resume.achievements)
    ? resume.achievements
    : [];
  const languages = Array.isArray(resume.languages) ? resume.languages : [];

  return (
    <>
      <style>{`
        ${FONT_IMPORT}

        .rio-modern-page,
        .rio-modern-page * {
          box-sizing: border-box;
        }

        .rio-modern-page {
          width: 210mm;
          min-height: 297mm;
          padding: 8mm 14mm 10mm;
          background: #ffffff;
          color: ${TEXT};
          font-family: "Source Sans 3", "Source Sans Pro", Arial, sans-serif;
          font-size: 9pt;
          line-height: 1.18;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        .rio-modern-header {
          width: 100%;
          text-align: center;
          margin-bottom: 5.5mm;
        }

        .rio-modern-name {
          font-family: "Roboto", Arial, sans-serif;
          line-height: 1;
          white-space: nowrap;
        }

        .rio-modern-first-name {
          font-size: 32pt;
          line-height: 1;
          font-weight: 300;
          color: ${GRAY};
        }

        .rio-modern-last-name {
          font-size: 32pt;
          line-height: 1;
          font-weight: 700;
          color: ${TEXT};
        }

        .rio-modern-position {
          margin-top: 1.1mm;
          font-family: "Source Sans 3", "Source Sans Pro", Arial, sans-serif;
          font-size: 7.6pt;
          line-height: 1;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: ${ACCENT};
        }

        .rio-modern-address {
          margin-top: 1.1mm;
          font-family: "Roboto", Arial, sans-serif;
          font-size: 8pt;
          line-height: 1.05;
          font-style: italic;
          font-weight: 300;
          color: ${LIGHT_GRAY};
        }

        .rio-modern-social-row {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1.2mm;
          margin-top: 1.5mm;
          font-family: "Roboto", Arial, sans-serif;
          font-size: 6.8pt;
          line-height: 1;
          color: ${TEXT};
        }

        .rio-modern-social-item {
          display: inline-flex;
          align-items: center;
          gap: 0.7mm;
        }

        .rio-modern-social-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 9px;
          font-size: 6.4pt;
          font-weight: 500;
        }

        .rio-modern-social-separator {
          color: ${GRAY};
          padding: 0 0.5mm;
        }

        .rio-modern-link,
        .rio-modern-link:visited {
          color: inherit;
          text-decoration: none;
        }

        .rio-modern-link:hover {
          color: ${ACCENT};
        }

        .rio-modern-section {
          margin-top: 3mm;
          page-break-inside: auto;
        }

        .rio-modern-section-heading {
          display: flex;
          align-items: center;
          gap: 2.2mm;
          width: 100%;
          margin-bottom: 2.2mm;
        }

        .rio-modern-section-heading h2 {
          flex: 0 0 auto;
          margin: 0;
          padding: 0;
          font-family: "Source Sans 3", "Source Sans Pro", Arial, sans-serif;
          font-size: 16pt;
          line-height: 1;
          font-weight: 700;
          color: ${ACCENT};
        }

        .rio-modern-section-rule {
          flex: 1 1 auto;
          height: 0.9pt;
          background: ${DIVIDER};
          opacity: 0.72;
        }

        .rio-modern-section-content {
          width: 100%;
        }

        .rio-modern-summary {
          font-size: 9pt;
          line-height: 1.25;
          font-weight: 300;
          color: ${TEXT};
          text-align: left;
        }

        .rio-modern-entry {
          width: 100%;
          margin: 0 0 2.5mm;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .rio-modern-entry:last-child {
          margin-bottom: 0;
        }

        .rio-modern-entry-top {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 42mm;
          column-gap: 4mm;
          align-items: start;
        }

        .rio-modern-entry-left {
          min-width: 0;
        }

        .rio-modern-entry-right {
          min-width: 0;
          text-align: right;
        }

        .rio-modern-entry-title {
          font-size: 10pt;
          line-height: 1.08;
          font-weight: 700;
          color: ${DARK_TEXT};
        }

        .rio-modern-entry-position {
          margin-top: 0.55mm;
          font-size: 8pt;
          line-height: 1.05;
          font-weight: 400;
          font-variant: small-caps;
          letter-spacing: 0.025em;
          color: ${GRAY};
        }

        .rio-modern-entry-date {
          font-size: 8pt;
          line-height: 1.05;
          font-weight: 300;
          font-style: italic;
          color: ${GRAY};
        }

        .rio-modern-entry-location {
          margin-bottom: 0.45mm;
          font-size: 9pt;
          line-height: 1.05;
          font-weight: 300;
          font-style: italic;
          color: ${ACCENT};
        }

        .rio-modern-description {
          margin-top: 0.9mm;
          font-size: 9pt;
          line-height: 1.15;
          font-weight: 300;
          color: ${TEXT};
        }

        .rio-modern-bullet {
          display: grid;
          grid-template-columns: 2.7mm minmax(0, 1fr);
          column-gap: 1mm;
          align-items: start;
        }

        .rio-modern-bullet > span:first-child {
          font-size: 7pt;
          line-height: 1.25;
          padding-top: 0.15mm;
        }

        .rio-modern-project-links {
          margin-top: 0.55mm;
          font-size: 7.5pt;
          line-height: 1.05;
          color: ${ACCENT};
        }

        .rio-modern-project-links a {
          color: ${ACCENT};
          text-decoration: none;
        }

        .rio-modern-project-links a:hover {
          text-decoration: underline;
        }

        .rio-modern-skills-row {
          display: grid;
          grid-template-columns: 31mm minmax(0, 1fr);
          column-gap: 4mm;
          margin: 0;
          break-inside: avoid;
        }

        .rio-modern-skill-label {
          font-size: 10pt;
          line-height: 1.12;
          font-weight: 700;
          color: ${DARK_TEXT};
          text-align: right;
        }

        .rio-modern-skill-value {
          font-size: 9pt;
          line-height: 1.18;
          font-weight: 300;
          color: ${TEXT};
        }

        .rio-modern-simple-list {
          font-size: 9pt;
          line-height: 1.15;
          font-weight: 300;
          color: ${TEXT};
        }

        @media print {
          .rio-modern-page {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          a {
            color: inherit !important;
            text-decoration: none !important;
          }
        }

        @media screen and (max-width: 900px) {
          .rio-modern-page {
            transform-origin: top left;
          }
        }
      `}</style>

      <div className="rio-modern-page">
        <Header profile={profile} summary={resume.summary} />

        {resume.summary ? (
          <Section title="Summary">
            <div className="rio-modern-summary">{resume.summary}</div>
          </Section>
        ) : null}

        {experience.length > 0 ? (
          <Section title="Experience">
            {experience.map((item, index) => (
              <ExperienceEntry item={item} key={item?._id || index} />
            ))}
          </Section>
        ) : null}

        {projects.length > 0 ? (
          <Section title="Projects">
            {projects.map((item, index) => (
              <ProjectEntry item={item} key={item?._id || index} />
            ))}
          </Section>
        ) : null}

        {education.length > 0 ? (
          <Section title="Education">
            {education.map((item, index) => (
              <EducationEntry item={item} key={item?._id || index} />
            ))}
          </Section>
        ) : null}

        {resume.skills?.length > 0 ? (
          <Section title="Skills">
            <SkillsSection skills={resume.skills} />
          </Section>
        ) : null}

        {certifications.length > 0 ? (
          <Section title="Certifications">
            <SimpleListSection items={certifications} />
          </Section>
        ) : null}

        {achievements.length > 0 ? (
          <Section title="Achievements">
            <SimpleListSection items={achievements} />
          </Section>
        ) : null}

        {languages.length > 0 ? (
          <Section title="Languages">
            <SimpleListSection items={languages} />
          </Section>
        ) : null}
      </div>
    </>
  );
}
