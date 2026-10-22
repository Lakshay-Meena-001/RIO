import {
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Target,
  Lightbulb,
  BriefcaseBusiness,
  GraduationCap,
  FileText,
  ArrowRight,
} from "lucide-react";

import Surface from "../components/ui/Surface";

const text = (value) => (value == null || value === "" ? "" : String(value));
const list = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);
const urlFor = (value) => {
  const valueText = text(value).trim();
  if (!valueText) return "";
  return /^https?:\/\//i.test(valueText) ? valueText : `https://${valueText}`;
};
const cx = (...values) => values.filter(Boolean).join(" ");

function Section({ icon: Icon, title, count, children, className = "" }) {
  return (
    <Surface
      variant="scorer"
      className={cx(
        "p-4 sm:p-6 shadow-[0_18px_50px_rgba(0,0,0,0.13)]",
        className,
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-[#D4D4D8]">
            <Icon size={16} strokeWidth={1.6} />
          </div>
          <h2 className="text-sm font-semibold tracking-tight text-white">
            {title}
          </h2>
        </div>
        {count != null && (
          <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-2.5 py-1 text-[10px] tabular-nums text-[#858994]">
            {count}
          </span>
        )}
      </div>
      {children}
    </Surface>
  );
}

function ItemList({ items, empty = "No details available." }) {
  return items.length ? (
    <ul className="space-y-3">
      {items.map((item, index) => {
        const title =
          typeof item === "string"
            ? item
            : item?.title ||
              item?.name ||
              item?.skill ||
              item?.role ||
              item?.text ||
              item?.description ||
              "";
        const description =
          typeof item === "object"
            ? item?.description || item?.reason || item?.details || ""
            : "";
        return (
          <li
            key={`${title}-${index}`}
            className="flex gap-3 text-[13px] leading-6 text-[#C4C6CC]"
          >
            <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />
            <span className="min-w-0">
              {title || "Recommendation"}
              {description && description !== title && (
                <span className="mt-1 block text-xs leading-5 text-[#858994]">
                  {description}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  ) : (
    <p className="text-xs leading-5 text-[#777B85]">{empty}</p>
  );
}

function Meta({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#71747C]">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-medium text-[#D4D4D8]">
        {value}
      </p>
    </div>
  );
}

export default function ScorerReport({
  resume,
  onBackToScorer,
  onDeleteHistory,
}) {
  const profile = resume?.profile || {};
  const analysis = resume?.analysis || {};
  const rawScore = Number(analysis.score ?? resume?.score);
  const score = Number.isFinite(rawScore)
    ? Math.max(0, Math.min(100, Math.round(rawScore)))
    : 0;
  const strengths = list(analysis.strengths);
  const weaknesses = list(analysis.weaknesses);
  const missingSkills = list(analysis.missingSkills);
  const roles = list(analysis.suggestedRoles);
  const recommendations = list(analysis.recommendations);
  const skills = list(profile.skills);
  const contact = [
    profile.email && {
      icon: Mail,
      label: profile.email,
      href: `mailto:${profile.email}`,
    },
    profile.phone && {
      icon: Phone,
      label: profile.phone,
      href: `tel:${profile.phone}`,
    },
    profile.location && {
      icon: MapPin,
      label: profile.location,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.location)}`,
    },
    profile.linkedIn && {
      icon: ExternalLink,
      label: "LinkedIn profile",
      href: urlFor(profile.linkedIn),
    },
    profile.github && {
      icon: ExternalLink,
      label: "GitHub profile",
      href: urlFor(profile.github),
    },
  ].filter(Boolean);
  const scoreLabel =
    score >= 80
      ? "Strong foundation"
      : score >= 60
        ? "Good foundation, room to grow"
        : score >= 40
          ? "Some key gaps to address"
          : "Start with the essentials";
  const dateValue =
    resume?.analyzedAt || resume?.createdAt || resume?.updatedAt;
  const reportDate =
    dateValue && !Number.isNaN(new Date(dateValue).getTime())
      ? new Date(dateValue).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Saved assessment";

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4 px-1 text-white sm:space-y-5 sm:px-0">
      <div className="flex flex-col justify-between gap-3 border-b border-white/[0.08] pb-4 sm:gap-4 sm:pb-6 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#858994]">
            <span className="h-1.5 w-1.5 rounded-full bg-white/75" /> Resume
            assessment
          </p>
          <h1 className="mt-2 text-[29px] font-semibold leading-tight tracking-[-0.045em] sm:text-[38px]">
            Your resume report.
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#858994]">
            A practical breakdown of what is working, what needs attention, and
            where to focus next.
          </p>
        </div>
        <div className="hidden sm:flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          {onDeleteHistory && (
            <button
              type="button"
              onClick={onDeleteHistory}
              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-white-500/20 px-4 py-2.5 text-xs font-semibold bg-white bg-white text-[#17191C] transition "
            >
              Delete History
            </button>
          )}

          {onBackToScorer && (
            <button
              type="button"
              onClick={onBackToScorer}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 py-2.5 text-xs font-semibold text-[#D4D4D8] transition hover:border-white/20 hover:bg-white/[0.065] hover:text-white"
            >
              New analysis
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Surface className="p-4 sm:p-7">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
            <div className="relative h-[116px] w-[116px] shrink-0">
              <svg viewBox="0 0 116 116" className="h-full w-full -rotate-90">
                <circle
                  cx="58"
                  cy="58"
                  r="49"
                  fill="none"
                  stroke="rgba(255,255,255,.075)"
                  strokeWidth="7"
                />
                <circle
                  cx="58"
                  cy="58"
                  r="49"
                  fill="none"
                  stroke="rgba(255,255,255,.9)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 49}
                  strokeDashoffset={2 * Math.PI * 49 * (1 - score / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold tracking-[-0.05em] tabular-nums">
                  {score}
                </span>
                <span className="mt-0.5 text-[9px] uppercase tracking-[0.17em] text-[#858994]">
                  out of 100
                </span>
              </div>
            </div>
            <div className="min-w-0 w-full sm:w-auto">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#858994]">
                Overall resume score
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                {scoreLabel}
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-[13px] leading-6 text-[#92949B] sm:mx-0">
                {text(analysis.summary) ||
                  "Review the insights below to understand what is working and what to improve next."}
              </p>
            </div>
          </div>
          <div className="mx-auto mt-5 h-1 w-full max-w-[520px] overflow-hidden rounded-full bg-white/[0.07] sm:mx-0 sm:mt-6 sm:max-w-none">
            <div
              className="h-full rounded-full bg-white/80 transition-all"
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Meta label="Report date" value={reportDate} />
            <Meta label="Strengths" value={strengths.length} />
            <Meta label="Action items" value={recommendations.length} />
          </div>
        </Surface>

        <Surface className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-[#D4D4D8]">
              <FileText size={17} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#858994]">
                Candidate profile
              </p>
              <h2 className="mt-2 break-words text-xl font-semibold tracking-[-0.035em]">
                {text(profile.name || analysis.candidateName) || "Your resume"}
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#858994]">
                {text(
                  profile.headline || profile.title || profile.currentRole,
                ) || "Professional profile"}
              </p>
            </div>
          </div>
          {contact.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2 border-t border-white/[0.08] pt-4 sm:mt-5 sm:justify-start">
              {contact.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.035] px-3 py-2 text-[11px] text-[#C4C6CC] transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                >
                  <Icon size={13} />
                  <span className="truncate">{label}</span>
                  {href.startsWith("http") && <ExternalLink size={10} />}
                </a>
              ))}
            </div>
          )}
          {text(profile.headline || profile.title || profile.currentRole) && (
            <div className="mt-4 border-t border-white/[0.07] pt-4 text-center sm:mt-5 sm:text-left">
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#71747C]">
                Professional focus
              </p>
              <p className="mt-2 text-xs leading-5 text-[#C4C6CC]">
                {text(profile.headline || profile.title || profile.currentRole)}
              </p>
            </div>
          )}
        </Surface>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section icon={CheckCircle2} title="Strengths" count={strengths.length}>
          <ItemList
            items={strengths}
            empty="No strengths were returned for this report."
          />
        </Section>
        <Section
          icon={AlertTriangle}
          title="Areas to improve"
          count={weaknesses.length}
        >
          <ItemList
            items={weaknesses}
            empty="No improvement areas were returned."
          />
        </Section>
        <Section
          icon={Target}
          title="Missing skills"
          count={missingSkills.length}
        >
          <ItemList
            items={missingSkills}
            empty="No missing skills identified."
          />
        </Section>
        <Section
          icon={BriefcaseBusiness}
          title="Suggested roles"
          count={roles.length}
        >
          <ItemList items={roles} empty="No role suggestions returned." />
        </Section>
      </div>

      <Section
        icon={Lightbulb}
        title="Recommended next steps"
        count={recommendations.length}
      >
        {recommendations.length ? (
          <ol className="space-y-4">
            {recommendations.map((item, index) => {
              const title =
                typeof item === "string"
                  ? item
                  : item?.title ||
                    item?.action ||
                    item?.name ||
                    `Recommendation ${index + 1}`;
              const description =
                typeof item === "object"
                  ? item?.description || item?.details || item?.reason || ""
                  : "";
              return (
                <li key={`${title}-${index}`} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.025] text-[10px] font-semibold text-[#BFC1C8]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[13px] font-semibold leading-5 text-[#E4E4E7]">
                      {title}
                    </p>
                    {description && (
                      <p className="mt-1 text-xs leading-5 text-[#858994]">
                        {description}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-xs text-[#777B85]">
            No recommendations returned for this report.
          </p>
        )}
      </Section>

      {(text(profile.summary) ||
        text(profile.education) ||
        text(profile.experience) ||
        text(profile.projects) ||
        skills.length > 0) && (
        <Section icon={GraduationCap} title="Resume details">
          <div className="grid gap-5 sm:grid-cols-2">
            {profile.summary && (
              <div>
                <h3 className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#71747C]">
                  Summary
                </h3>
                <p className="whitespace-pre-line text-[13px] leading-6 text-[#C4C6CC]">
                  {text(profile.summary)}
                </p>
              </div>
            )}
            {skills.length > 0 && (
              <div>
                <h3 className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#71747C]">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => {
                    const name =
                      typeof skill === "string"
                        ? skill
                        : skill?.name || skill?.skill || "";
                    return name ? (
                      <span
                        key={`${name}-${index}`}
                        className="rounded-lg border border-white/[0.09] bg-white/[0.03] px-2.5 py-1.5 text-xs text-[#C4C6CC]"
                      >
                        {name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            {profile.education && (
              <div>
                <h3 className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#71747C]">
                  Education
                </h3>
                <p className="whitespace-pre-line text-[13px] leading-6 text-[#C4C6CC]">
                  {typeof profile.education === "string"
                    ? profile.education
                    : JSON.stringify(profile.education, null, 2)}
                </p>
              </div>
            )}
            {profile.experience && (
              <div>
                <h3 className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#71747C]">
                  Experience
                </h3>
                <p className="whitespace-pre-line text-[13px] leading-6 text-[#C4C6CC]">
                  {typeof profile.experience === "string"
                    ? profile.experience
                    : JSON.stringify(profile.experience, null, 2)}
                </p>
              </div>
            )}
            {profile.projects && (
              <div>
                <h3 className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#71747C]">
                  Projects
                </h3>
                <p className="whitespace-pre-line text-[13px] leading-6 text-[#C4C6CC]">
                  {typeof profile.projects === "string"
                    ? profile.projects
                    : JSON.stringify(profile.projects, null, 2)}
                </p>
              </div>
            )}
          </div>
        </Section>
      )}
      <p className="pb-2 text-center text-[10px] leading-5 text-[#62656D]">
        Generated by RIO Resume Scorer · Insights are guidance, not a hiring
        guarantee.
      </p>
    </div>
  );
}
