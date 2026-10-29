import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Check,
  Clock3,
  Eye,
  FileText,
  FolderKanban,
  GraduationCap,
  Languages,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  Wrench,
  X,
  Save,
} from "lucide-react";
import ResumeForm from "./ResumeForm";
import PreviewResume from "../../components/resume/PreviewResume";
import BasicTemplate from "../../components/resume/templates/BasicTemplate";
import ModernTemplate from "../../components/resume/templates/ModernTemplate";
import ProfessionalTemplate from "../../components/resume/templates/ProfessionalTemplate";
import initialResumeData from "../../components/resume/initialData";
import {
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
} from "../../api/resume/resume.api";
import { setResume } from "../../redux/resumeSlice";

const TEMPLATES = {
  basic: { label: "Basic", Component: BasicTemplate },
  modern: { label: "Modern", Component: ModernTemplate },
  professional: { label: "Professional", Component: ProfessionalTemplate },
};
const clone = (value) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};
const normalize = (resume) => ({
  ...clone(initialResumeData),
  ...(resume || {}),
  profile: { ...(initialResumeData.profile || {}), ...(resume?.profile || {}) },
  summary: resume?.summary || "",
  experience: Array.isArray(resume?.experience) ? clone(resume.experience) : [],
  education: Array.isArray(resume?.education) ? clone(resume.education) : [],
  projects: Array.isArray(resume?.projects) ? clone(resume.projects) : [],
  skills: Array.isArray(resume?.skills) ? clone(resume.skills) : [],
  certifications: Array.isArray(resume?.certifications)
    ? clone(resume.certifications)
    : [],
  achievements: Array.isArray(resume?.achievements)
    ? clone(resume.achievements)
    : [],
  languages: Array.isArray(resume?.languages) ? clone(resume.languages) : [],
});
const unwrap = (response) =>
  response?.data?.profile
    ? response.data
    : response?.profile
      ? response
      : response?.data?.data?.profile
        ? response.data.data
        : null;
const dateLabel = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

function DetailText({ label, value }) {
  if (value === undefined || value === null || String(value).trim() === "")
    return null;
  return (
    <div className="min-w-0 rounded-xl border border-white/[.07] bg-white/[.025] px-3.5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-white/40">
        {label}
      </p>
      <p className="mt-1.5 whitespace-pre-wrap break-words text-[14px] leading-6 text-white/85">
        {String(value)}
      </p>
    </div>
  );
}
function EntryList({
  items,
  titleKeys,
  subtitleKeys,
  dateKeys,
  descriptionKeys,
}) {
  if (!items?.length)
    return (
      <div className="rounded-xl border border-dashed border-white/[.10] bg-white/[.015] px-4 py-5 text-[13px] text-white/40">
        No details added yet.
      </div>
    );
  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        if (typeof item === "string")
          return (
            <p
              key={`${item}-${index}`}
              className="rounded-xl border border-white/[.08] bg-white/[.025] px-4 py-3.5 text-[14px] leading-6 text-white/80"
            >
              {item}
            </p>
          );
        const pick = (keys) =>
          keys
            .map((key) => item?.[key])
            .find(
              (value) =>
                value !== undefined && value !== null && String(value).trim(),
            );
        const title = pick(titleKeys) || `Entry ${index + 1}`;
        const subtitle = pick(subtitleKeys);
        const dates = dateKeys
          .map((key) => item?.[key])
          .filter(Boolean)
          .join(" · ");
        const description = pick(descriptionKeys);
        return (
          <div
            key={item?._id || `${title}-${index}`}
            className="rounded-2xl border border-white/[.08] bg-[linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018))] p-4 sm:p-5"
          >
            <p className="text-[15px] font-semibold leading-6 text-white/90">
              {title}
            </p>
            {subtitle && (
              <p className="mt-1.5 text-[13px] leading-5 text-white/60">
                {subtitle}
              </p>
            )}
            {dates && (
              <p className="mt-2 inline-flex rounded-lg border border-white/[.07] bg-black/15 px-2.5 py-1 text-[11px] text-white/45">
                {dates}
              </p>
            )}
            {description && (
              <p className="mt-3 whitespace-pre-wrap text-[14px] leading-6 text-white/70">
                {description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ResumeHistoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedResumeId = searchParams.get("resumeId") || "";
  const dispatch = useDispatch();
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const historyPageSize = 10;
  const [selectedId, setSelectedId] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [draft, setDraft] = useState(null);
  const [originalDraft, setOriginalDraft] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [template, setTemplate] = useState("basic");
  const [resumeTheme, setResumeTheme] = useState("light");
  const resumePrintRef = useRef(null);
  const dirty =
    editing && JSON.stringify(draft) !== JSON.stringify(originalDraft);

  const selectedIdRef = useRef(selectedId);

  // Keep the latest selection available to async history refreshes without
  // mutating a ref during render.
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const loadHistory = useCallback(async (preferredId) => {
    try {
      const response = await getResumes();
      setError("");
      const rows = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      const sorted = [...rows].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0),
      );
      setHistory(sorted);
      const nextId =
        preferredId &&
        sorted.some((item) => String(item._id) === String(preferredId))
          ? String(preferredId)
          : sorted.some(
                (item) => String(item._id) === String(selectedIdRef.current),
              )
            ? String(selectedIdRef.current)
            : String(sorted[0]?._id || "");
      setLoadingDetail(Boolean(nextId));
      setSelectedId(nextId);
      if (!nextId) {
        setSelectedResume(null);
        setDraft(null);
        setOriginalDraft(null);
        setEditing(false);
      }
      return sorted;
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load your saved resumes.",
      );
      return [];
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadDetail = useCallback(async (id) => {
    if (!id) return;
    try {
      const response = await getResumeById(id);
      setError("");
      const resume = unwrap(response);
      if (!resume) throw new Error("The selected resume could not be read.");
      setSelectedResume(resume);
      const normalized = normalize(resume);
      setDraft(clone(normalized));
      setOriginalDraft(clone(normalized));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load this resume.",
      );
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Defer the async loader until after the effect's synchronous phase. The
    // loader owns its loading/error state updates after its request resolves.
    const startHistoryLoad = async () => {
      await Promise.resolve();
      if (!cancelled) await loadHistory(requestedResumeId);
    };

    void startHistoryLoad();
    return () => {
      cancelled = true;
    };
  }, [loadHistory, requestedResumeId]);

  // Load details whenever the selected resume changes.
  useEffect(() => {
    if (!selectedId) return undefined;
    let cancelled = false;

    const startDetailLoad = async () => {
      await Promise.resolve();
      if (!cancelled) await loadDetail(selectedId);
    };

    void startDetailLoad();
    return () => {
      cancelled = true;
    };
  }, [selectedId, loadDetail]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) =>
      [
        item.profile?.name,
        item.profile?.email,
        item._id,
        item.processing?.status,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [history, query]);

  const historyPages = Math.max(
    1,
    Math.ceil(filtered.length / historyPageSize),
  );
  const pagedHistory = filtered.slice(
    (historyPage - 1) * historyPageSize,
    historyPage * historyPageSize,
  );

  const chooseResume = (id) => {
    if (String(id) === String(selectedId)) return;
    if (
      dirty &&
      !window.confirm(
        "You have unsaved edits. Discard them and open another resume?",
      )
    )
      return;
    setSelectedResume(null);
    setDraft(null);
    setOriginalDraft(null);
    setEditing(false);
    setLoadingDetail(true);
    setSelectedId(String(id));
  };

  const startEdit = () => {
    if (!draft) return;
    setOriginalDraft(clone(draft));
    setEditing(true);
    setNotice("");
    setError("");
  };
  const cancelEdit = () => {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    setDraft(clone(originalDraft || normalize(selectedResume)));
    setEditing(false);
    setError("");
    setNotice("");
  };

  const saveChanges = async () => {
    if (!selectedId || !draft || saving) return;
    if (!dirty) {
      setNotice("Everything is already up to date.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await updateResume({ ...draft, resumeId: selectedId });
      const updated = unwrap(response);
      if (!updated)
        throw new Error("The server did not return the updated resume.");
      const normalized = normalize(updated);
      setSelectedResume(updated);
      setDraft(clone(normalized));
      setOriginalDraft(clone(normalized));
      setEditing(false);
      dispatch(setResume(updated));
      await loadHistory(selectedId);
      setNotice("Resume updated successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Resume update failed. Your edits are still here.",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeResume = async () => {
    if (!selectedId || deleting) return;
    setDeleting(true);
    setError("");
    try {
      await deleteResume(selectedId);
      const remaining = history.filter(
        (item) => String(item._id) !== String(selectedId),
      );
      setHistory(remaining);
      setDeleteOpen(false);
      setEditing(false);
      setNotice("Resume deleted successfully.");
      const nextId = String(remaining[0]?._id || "");
      setSelectedResume(null);
      setDraft(null);
      setOriginalDraft(null);
      setSelectedId(nextId);
      if (!nextId) {
        setSelectedResume(null);
        setDraft(null);
        setOriginalDraft(null);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not delete this resume.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const data = draft || normalize(selectedResume);
  const profile = data?.profile || {};
  const TemplateComponent = TEMPLATES[template]?.Component || BasicTemplate;
  const displayName = profile.name?.trim() || "Untitled resume";
  const detailSections = [
    {
      title: "Profile",
      icon: UserRound,
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailText label="Full name" value={profile.name} />
          <DetailText
            label="Professional title"
            value={profile.title || profile.headline}
          />
          <DetailText label="Email" value={profile.email} />
          <DetailText label="Phone" value={profile.phone} />
          <DetailText label="Location" value={profile.location} />
          <DetailText label="LinkedIn" value={profile.linkedIn} />
          <DetailText label="GitHub" value={profile.github} />
          <DetailText label="Portfolio" value={profile.portfolio} />
          <DetailText label="LeetCode" value={profile.leetcode} />
        </div>
      ),
    },
    {
      title: "Professional summary",
      icon: FileText,
      content: (
        <p className="rounded-2xl border border-white/[.08] bg-[linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.015))] p-4 text-[14px] leading-7 text-white/75 sm:p-5">
          {data.summary || "No professional summary added yet."}
        </p>
      ),
    },
    {
      title: "Work experience",
      icon: BriefcaseBusiness,
      count: data.experience?.length || 0,
      content: (
        <EntryList
          items={data.experience}
          titleKeys={["role", "title", "position"]}
          subtitleKeys={["company", "organization"]}
          dateKeys={["startDate", "endDate", "duration"]}
          descriptionKeys={["description", "responsibilities", "achievements"]}
        />
      ),
    },
    {
      title: "Education",
      icon: GraduationCap,
      count: data.education?.length || 0,
      content: (
        <EntryList
          items={data.education}
          titleKeys={["degree", "qualification", "school", "institution"]}
          subtitleKeys={["institution", "school", "field", "major"]}
          dateKeys={["startDate", "endDate", "year"]}
          descriptionKeys={["description", "details"]}
        />
      ),
    },
    {
      title: "Projects",
      icon: FolderKanban,
      count: data.projects?.length || 0,
      content: (
        <EntryList
          items={data.projects}
          titleKeys={["name", "title"]}
          subtitleKeys={["technologies", "techStack", "role"]}
          dateKeys={["startDate", "endDate"]}
          descriptionKeys={["description", "details", "impact"]}
        />
      ),
    },
    {
      title: "Skills",
      icon: Wrench,
      count: data.skills?.length || 0,
      content: (
        <div className="flex flex-wrap gap-2.5">
          {data.skills?.length ? (
            data.skills.map((skill, i) => (
              <span
                key={i}
                className="rounded-xl border border-white/[.09] bg-white/[.04] px-3.5 py-2 text-[13px] font-medium text-white/80"
              >
                {typeof skill === "string"
                  ? skill
                  : skill.name || skill.skill || JSON.stringify(skill)}
              </span>
            ))
          ) : (
            <p className="text-xs text-white/35">No skills added yet.</p>
          )}
        </div>
      ),
    },
    {
      title: "Certifications",
      icon: Award,
      count: data.certifications?.length || 0,
      content: (
        <EntryList
          items={data.certifications}
          titleKeys={["name", "title", "certification"]}
          subtitleKeys={["issuer", "organization"]}
          dateKeys={["date", "year"]}
          descriptionKeys={["description"]}
        />
      ),
    },
    {
      title: "Achievements",
      icon: Award,
      count: data.achievements?.length || 0,
      content: (
        <EntryList
          items={data.achievements}
          titleKeys={["name", "title"]}
          subtitleKeys={["issuer", "organization"]}
          dateKeys={["date", "year"]}
          descriptionKeys={["description"]}
        />
      ),
    },
    {
      title: "Languages",
      icon: Languages,
      count: data.languages?.length || 0,
      content: (
        <div className="flex flex-wrap gap-2.5">
          {data.languages?.length ? (
            data.languages.map((language, i) => (
              <span
                key={i}
                className="rounded-xl border border-white/[.09] bg-white/[.04] px-3.5 py-2 text-[13px] font-medium text-white/80"
              >
                {typeof language === "string"
                  ? language
                  : [
                      language.name || language.language,
                      language.proficiency || language.level,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
              </span>
            ))
          ) : (
            <p className="text-xs text-white/35">No languages added yet.</p>
          )}
        </div>
      ),
    },
  ];

  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  return (
    <div className="rio-resume-history fixed inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_48%_0%,rgba(255,255,255,0.055),transparent_38%),#101113] text-white">
      <style>{`
      @keyframes resumeHistoryEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .rio-resume-history { animation: resumeHistoryEnter 300ms cubic-bezier(.22,1,.36,1); }
      .resume-history-item { animation: resumeHistoryEnter 260ms both; }
      .rio-history-scroll { scrollbar-width: none; }
      .rio-history-scroll::-webkit-scrollbar { display: none; }
      .rio-resume-fieldset { min-width: 0; width: 100%; overflow-wrap: anywhere; }
      .rio-resume-fieldset input, .rio-resume-fieldset textarea, .rio-resume-fieldset select { max-width: 100%; min-width: 0; }
      @media (max-width: 639px) {
        .rio-resume-history { height: 100dvh; width: 100vw; overflow: hidden; }
        .rio-resume-history .rio-mobile-content { padding-left: 16px; padding-right: 16px; padding-bottom: calc(116px + env(safe-area-inset-bottom)); padding-top: 22px; }
        .rio-resume-history .rio-detail-title { font-size: clamp(25px, 7vw, 32px); line-height: 1.12; overflow-wrap: anywhere; }
        .rio-resume-history .rio-detail-section { border: 1px solid rgba(255,255,255,.085); border-radius: 20px; padding: 17px 15px; background: linear-gradient(145deg, rgba(255,255,255,.045), rgba(255,255,255,.018)); box-shadow: 0 10px 30px rgba(0,0,0,.10); }
        .rio-resume-history .rio-detail-section + .rio-detail-section { margin-top: 14px; }
      }
      @media (prefers-reduced-motion: reduce) { .rio-resume-history, .resume-history-item { animation: none !important; transition: none !important; } }
    `}</style>
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 88% 4%, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.025) 42%, transparent 72%), radial-gradient(ellipse 65% 55% at 0% 92%, rgba(255,255,255,0.035) 0%, transparent 70%), linear-gradient(135deg, #191b1e 0%, #17191c 48%, #141619 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.018] mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>
      <div className="relative z-10 flex h-full min-h-0">
        {/* LEFT: roadmap-style floating history sidebar */}
        <aside
          className={`absolute top-4 bottom-20 left-4 flex w-[min(282px,calc(100vw-1rem))] flex-col overflow-hidden rounded-[24px] border border-white/[.10] bg-[#111315]/95 shadow-[0_24px_80px_rgba(0,0,0,.32)] backdrop-blur-xl transition-transform duration-300 lg:inset-y-5 lg:left-5 lg:w-[min(282px,calc(100vw-2rem))] lg:translate-x-0 ${mobileHistoryOpen ? "z-[90] translate-x-0" : "z-50 -translate-x-[calc(100%+1rem)]"}`}
        >
          <div className="shrink-0 border-b border-white/[0.065] bg-white/[0.012] px-5 pb-5 pt-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#6B6D73]">
                  Your career
                </p>
                <h1 className="mt-2 text-[19px] font-semibold tracking-[-0.035em] text-white">
                  Resume history
                </h1>
                <p className="mt-1.5 text-[11px] leading-5 text-[#70727A]">
                  Every version, detail and next step — in one place.
                </p>
              </div>
              <button
                type="button"
                onClick={() => loadHistory(selectedId)}
                disabled={loadingList}
                aria-label="Refresh resume history"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-[#9B9DA4] transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
              >
                <RefreshCw
                  size={13}
                  className={loadingList ? "animate-spin" : ""}
                />
              </button>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
              <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#52545B]">
                Saved resumes
              </span>
              <span className="text-xs font-semibold tabular-nums text-[#D4D4D8]">
                {history.length}
              </span>
            </div>
            <label className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5">
              <Search size={13} className="shrink-0 text-[#686B74]" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setHistoryPage(1);
                }}
                placeholder="Find a resume…"
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#62656D]"
              />
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setHistoryPage(1);
                }}
                aria-label="Clear search"
                className={query ? "text-[#777B85] hover:text-white" : "hidden"}
              >
                <X size={13} />
              </button>
            </label>
          </div>
          <div className="rio-history-scroll min-h-0 flex-1 overflow-y-auto">
            {loadingList && !history.length && (
              <div className="flex min-h-[250px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-white/80" />
                  <p className="text-[11px] text-[#696B72]">
                    Loading your resumes…
                  </p>
                </div>
              </div>
            )}
            {!loadingList && filtered.length === 0 && (
              <div className="px-5 py-12">
                <div className="h-px w-10 bg-white/20" />
                <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#66686F]">
                  {query ? "No matches" : "A fresh start"}
                </p>
                <p className="mt-2 text-[17px] font-semibold tracking-[-0.03em] text-white">
                  {query ? "Nothing found." : "No resumes yet."}
                </p>
                <p className="mt-3 text-[11px] leading-5 text-[#70727A]">
                  {query
                    ? "Try another name or clear your search."
                    : "Create your first resume and it will live here."}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/builder")}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-xs font-semibold text-[#17191C]"
                >
                  <Plus size={13} /> Create resume
                </button>
              </div>
            )}
            {pagedHistory.map((item, index) => {
              const active = String(item._id) === String(selectedId);
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => {
                    chooseResume(item._id);
                    setMobileHistoryOpen(false);
                  }}
                  className={`resume-history-item group relative flex w-full items-start gap-3 border-b border-white/[0.045] px-5 py-[18px] text-left transition-colors ${active ? "bg-white/[0.065]" : "hover:bg-white/[0.035]"}`}
                  style={{ animationDelay: `${Math.min(index, 8) * 25}ms` }}
                >
                  {active && (
                    <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-white" />
                  )}
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${active ? "border-white/15 bg-white/[0.08] text-white" : "border-white/[0.08] bg-white/[0.025] text-[#777B85] group-hover:text-[#C4C6CC]"}`}
                  >
                    <FileText size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-xs font-semibold leading-4 text-white">
                      {item.profile?.name?.trim() || "Untitled resume"}
                    </span>
                    <span className="mt-1 block truncate text-[9px] uppercase tracking-[0.09em] text-[#66686F]">
                      {item.profile?.title ||
                        item.profile?.headline ||
                        item.profile?.email ||
                        "Professional resume"}
                    </span>
                    <span className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-[#55575E]">
                        {dateLabel(item.updatedAt || item.createdAt)}
                      </span>
                      {active && <Check size={12} className="text-white" />}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="shrink-0 border-t border-white/[.07] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-[#858994]">
                Page {historyPage} of {historyPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={historyPage <= 1}
                  onClick={() =>
                    setHistoryPage((page) => Math.max(1, page - 1))
                  }
                  aria-label="Previous page"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-[#D4D4D8] disabled:opacity-30"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  disabled={historyPage >= historyPages}
                  onClick={() =>
                    setHistoryPage((page) => Math.min(historyPages, page + 1))
                  }
                  aria-label="Next page"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-[#D4D4D8] disabled:opacity-30"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </aside>
        {mobileHistoryOpen && (
          <button
            type="button"
            aria-label="Close resume history"
            onClick={() => setMobileHistoryOpen(false)}
            className="absolute inset-0 z-40 backdrop-blur-xl bg-black/45 lg:hidden"
          />
        )}

        {/* CENTER: the roadmap detail page's central workspace rhythm */}
        <main className="min-w-0 flex-1 overflow-hidden pb-[env(safe-area-inset-bottom)] lg:pl-[302px] lg:pr-[302px]">
          <div className="flex h-full min-h-0 flex-col">
            <div className="mx-6 mt-6 hidden border-b border-white/[0.08] pb-5 lg:block">
              <button
                type="button"
                onClick={() => navigate("/builder/dashboard")}
                className="group inline-flex items-center gap-2 text-xs font-medium text-[#71717A] transition-colors duration-200 hover:text-white"
              >
                <ArrowLeft
                  size={14}
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
                Back to Resume Dashboard
              </button>
            </div>
            <div className="rio-history-mobile-header flex h-16 shrink-0 items-center border-b border-white/[0.07] bg-[#111214]/75 px-4 backdrop-blur-xl lg:hidden">
              <button
                type="button"
                onClick={() => navigate("/builder/dashboard")}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] text-[#D4D4D8] transition hover:bg-white/[0.08]"
                aria-label="Back to resume dashboard"
              >
                <ArrowLeft size={15} />
              </button>
              <div className="ml-3 min-w-0 border-l border-white/[0.09] pl-3">
                <p className="truncate text-[14px] font-semibold text-white">
                  {displayName}
                </p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-[#858994]">
                  Resume detail workspace
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                disabled={deleting}
                className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] text-white transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
            <div className="rio-history-scroll rio-mobile-content min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-6 sm:px-7 sm:py-8 lg:px-9 lg:py-9">
              {(error || notice) && (
                <div
                  role={error ? "alert" : "status"}
                  className={`mx-1 mb-5 flex items-start justify-between gap-3 rounded-2xl border p-4 text-xs leading-5 ${error ? "border-rose-300/15 bg-rose-300/[0.055] text-rose-100/90" : "border-emerald-300/15 bg-emerald-300/[0.055] text-emerald-100/90"}`}
                >
                  <span>{error || notice}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setNotice("");
                    }}
                    aria-label="Dismiss message"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
              {!selectedId ? (
                <section className="flex min-h-[calc(100dvh-13rem)] items-center justify-center px-5 py-10 text-center lg:min-h-[60vh]">
                  <div className="mx-auto flex w-full max-w-xl flex-col items-center">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.035] text-[#D4D4D8] shadow-[0_10px_32px_rgba(0,0,0,.16)]">
                      <FileText size={19} />
                    </div>
                    <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#858994]">
                      Your career workspace
                    </p>
                    <h2 className="max-w-sm text-[25px] font-semibold leading-[1.15] tracking-[-0.045em] text-[#F4F4F5] sm:text-3xl">
                      Your experience, beautifully presented.
                    </h2>
                    <p className="mt-4 max-w-[19rem] text-[13px] leading-6 text-[#A1A1AA] sm:max-w-md sm:text-[15px]">
                      Choose a resume from your history to review every section,
                      edit details and preview the final document.
                    </p>
                  </div>
                </section>
              ) : loadingDetail && !selectedResume ? (
                <div className="mx-auto max-w-3xl px-6 py-16">
                  <div className="h-7 w-48 animate-pulse rounded bg-white/[0.06]" />
                  <div className="mt-5 h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
                  <div className="mt-3 h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
                </div>
              ) : (
                <>
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#858994]">
                        {editing ? "EDITING YOUR RESUME" : "RESUME DETAILS"}
                      </p>
                      <h1 className="rio-detail-title mt-2 text-[27px] font-semibold leading-tight tracking-[-0.045em] text-[#F4F4F5] sm:text-[34px]">
                        {displayName}
                      </h1>
                      <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#A1A1AA] sm:text-[15px]">
                        {profile.title ||
                          profile.headline ||
                          "Your experience, skills and achievements — thoughtfully organised in one place."}
                      </p>
                    </div>
                    {editing ? (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="hidden lg:inline-flex items-center gap-2 rounded-xl border border-white/[.10] bg-white/[.035] px-3.5 py-2.5 text-xs font-semibold text-white/75 transition hover:bg-white/[.07]"
                      >
                        <X size={13} /> Cancel edit
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startEdit}
                        className="hidden lg:inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#17191C] shadow-[0_10px_30px_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5"
                      >
                        <Pencil size={13} /> Edit resume
                      </button>
                    )}
                  </div>
                  {editing ? (
                    <div className="rio-resume-fieldset">
                      <ResumeForm
                        data={data}
                        onChange={(next) => setDraft(normalize(next))}
                        onCreateNew={() => {
                          if (
                            !dirty ||
                            window.confirm(
                              "Leave this edit and open a new resume? Unsaved changes will be lost.",
                            )
                          )
                            navigate("/builder");
                        }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {detailSections.map(
                        ({ title, icon: Icon, content, count }) => (
                          <section
                            key={title}
                            className="rio-detail-section resume-history-item rounded-2xl border border-white/[.08] bg-[linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.012))] p-5 sm:p-6"
                          >
                            <div className="mb-5 flex items-center gap-3.5">
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.045] text-[#D4D4D8]">
                                <Icon size={18} />
                              </span>
                              <div className="min-w-0">
                                <h2 className="text-[17px] font-semibold tracking-[-0.025em] text-[#F4F4F5]">
                                  {title}
                                </h2>
                                {Number.isFinite(count) && (
                                  <p className="mt-1 text-[10px] uppercase tracking-[.13em] text-[#777B85]">
                                    {count} {count === 1 ? "entry" : "entries"}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="min-w-0">{content}</div>
                          </section>
                        ),
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT: same floating sidebar geometry as Roadmap History; resume-specific content */}
        <aside className="absolute inset-y-4 right-4 z-30 hidden w-[min(282px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[18px] border border-white/[0.11] bg-[#111315]/90 shadow-[0_22px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl lg:inset-y-5 lg:right-5 lg:flex">
          <div className="shrink-0 border-b border-white/[0.065] bg-white/[0.012] px-4 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#6B6D73]">
                  Your document
                </p>
                <h2 className="mt-2 text-[17px] font-semibold tracking-[-0.035em] text-white">
                  Template preview
                </h2>
                <p className="mt-1.5 text-[10px] leading-5 text-[#70727A]">
                  Choose a style and review the A4 resume.
                </p>
              </div>
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-white/80" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-1.5">
              {Object.entries(TEMPLATES).map(([id, item]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTemplate(id)}
                  className={`rounded-xl border px-1 py-2 text-[9px] font-semibold transition ${template === id ? "border-white/20 bg-white/[0.09] text-white" : "border-white/[0.07] bg-white/[0.02] text-[#6B6D73] hover:bg-white/[0.05] hover:text-white"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="rio-history-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <p className="mb-3 flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.16em] text-[#52545B]">
              <span>Live document</span>
              <span className="normal-case tracking-normal text-[#858994]">
                {selectedResume ? "A4 · Portrait" : "No selection"}
              </span>
            </p>
            {selectedResume && draft ? (
              <div className="mx-auto w-full max-w-[210px]">
                <div
                  className="relative mx-auto overflow-hidden bg-white shadow-[0_16px_40px_rgba(0,0,0,.32)]"
                  style={{
                    aspectRatio: "210 / 297",
                    background: resumeTheme === "dark" ? "#17191c" : "#ffffff",
                  }}
                >
                  <div
                    className="absolute left-0 top-0 origin-top-left"
                    style={{
                      width: "794px",
                      minHeight: "1123px",
                      transform: "scale(0.2645)",
                      transformOrigin: "top left",
                    }}
                  >
                    <div
                      ref={resumePrintRef}
                      className={`resume-page ${resumeTheme === "dark" ? "resume-theme-dark" : ""}`}
                      style={{
                        width: "210mm",
                        minHeight: "297mm",
                        background:
                          resumeTheme === "dark" ? "#17191c" : "#ffffff",
                        color: resumeTheme === "dark" ? "#e5e7eb" : "#111111",
                        overflow: "hidden",
                      }}
                    >
                      <TemplateComponent data={data} theme={resumeTheme} />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-center text-[9px] leading-4 text-[#55575E]">
                  {TEMPLATES[template]?.label || "Basic"} template · Live
                  preview
                </p>
              </div>
            ) : (
              <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[#66686F]">
                  <Eye size={15} />
                </div>
                <p className="mt-3 text-[11px] font-medium text-[#B8BAC1]">
                  No resume selected
                </p>
                <p className="mt-1 max-w-[175px] text-[10px] leading-5 text-[#66686F]">
                  Choose one from history to preview its document.
                </p>
              </div>
            )}
          </div>
          <div className="shrink-0 border-t border-white/[0.065] bg-white/[0.012] p-3.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                disabled={!selectedResume}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.035] px-2 py-2.5 text-[10px] font-semibold text-[#D4D4D8] transition hover:bg-white/[0.075] disabled:opacity-40"
              >
                <Eye size={12} /> Preview
              </button>
              <button
                type="button"
                onClick={saveChanges}
                disabled={!selectedResume || !dirty || saving}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-white px-2 py-2.5 text-[10px] font-semibold text-[#17191C] shadow-[0_10px_30px_rgba(255,255,255,0.06)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? (
                  <LoaderCircle size={12} className="animate-spin" />
                ) : (
                  <Save size={12} />
                )}{" "}
                Update
              </button>
            </div>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={!selectedResume || deleting}
              className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-white  px-3 py-2.5 text-[10px] font-semibold text-[#17191C] transition   disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={12} /> Delete resume
            </button>
            <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
              <span className="text-[9px] text-[#52545B]">
                {dirty ? "Unsaved changes" : "All changes saved"}
              </span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${dirty ? "bg-amber-200/80" : "bg-white/30"}`}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile action dock follows the Roadmap history interaction pattern. */}
      {!editing && selectedResume && !mobileHistoryOpen && (
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          aria-label="Preview resume"
          className="fixed bottom-[calc(104px+env(safe-area-inset-bottom))] right-5 z-[55] grid h-12 w-12 place-items-center rounded-full border border-white/[.16] bg-white text-[#17191C] shadow-[0_10px_32px_rgba(0,0,0,.38)] transition active:scale-95 lg:hidden"
        >
          <Eye size={19} />
        </button>
      )}
      <div className="rio-history-mobile-bottom-bar fixed inset-x-0 bottom-0 z-[60] border-t border-white/[0.08] bg-[#111315]/88 px-3 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
          {selectedId ? (
            editing ? (
              <>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  disabled={!selectedResume}
                  className="inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-[#D4D4D8] transition-colors duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-40"
                >
                  <Eye size={14} />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={saveChanges}
                  disabled={!selectedResume || !dirty || saving}
                  className="inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[#17191C] transition-colors duration-200 hover:bg-[#E8E8EB] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-40"
                >
                  {saving ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Update</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setMobileHistoryOpen((open) => !open)}
                  className="inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-[#D4D4D8] transition-colors duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rio-mobile-action-button"
                >
                  <Clock3 size={14} />
                  <span>My Resumes</span>
                </button>

                <button
                  type="button"
                  onClick={() => (editing ? cancelEdit() : startEdit())}
                  disabled={!selectedResume || loadingDetail}
                  className="inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[#17191C] transition-colors duration-200 hover:bg-[#E8E8EB] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  {editing ? (
                    <>
                      <X size={14} /> Cancel
                    </>
                  ) : (
                    <>
                      <Pencil size={14} /> Edit
                    </>
                  )}
                </button>
              </>
            )
          ) : (
            <button
              type="button"
              onClick={() => navigate("/builder")}
              className="inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[#17191C] transition-colors duration-200 hover:bg-[#E8E8EB] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <Plus size={14} />
              <span>Create resume</span>
            </button>
          )}
        </div>
      </div>

      {previewOpen && selectedResume && (
        <PreviewResume
          data={data}
          selectedTemplate={template}
          onTemplateChange={setTemplate}
          resumeTheme={resumeTheme}
          onThemeChange={setResumeTheme}
          onClose={() => setPreviewOpen(false)}
        />
      )}
      {deleteOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting)
              setDeleteOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-resume-heading"
            className="w-full max-w-md rounded-[18px] border border-white/[0.11] bg-[#17191c] p-6 shadow-[0_24px_80px_rgba(0,0,0,.4)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-[#17191C]">
              <Trash2 size={16} />
            </div>
            <h2
              id="delete-resume-heading"
              className="mt-4 text-lg font-semibold tracking-[-.025em]"
            >
              Delete this resume?
            </h2>
            <p className="mt-2 text-[12px] leading-6 text-[#858994]">
              “{displayName}” will be permanently deleted from your account.
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
                className="rounded-xl border border-white/[.10] bg-white/[.035] px-4 py-2.5 text-xs font-semibold text-white/70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={removeResume}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl border  bg-white px-4 py-2.5 text-xs font-semibold text-[#17191C]"
              >
                {deleting ? (
                  <LoaderCircle size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}{" "}
                Delete resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
