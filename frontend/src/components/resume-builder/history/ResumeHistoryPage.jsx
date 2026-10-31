import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import ResumeHistoryWorkspace from "../../components/resume-builder/history/ResumeHistoryWorkspace";
import "./resume-builder.css";
import { createResumeDetailSections } from "../../components/resume-builder/details/createResumeDetailSections";
import ResumeHistorySidebar from "../../components/resume-builder/history/ResumeHistorySidebar";
import ResumeHistoryPreviewPanel from "../../components/resume-builder/history/ResumeHistoryPreviewPanel";
import ResumeHistoryMobileActions from "../../components/resume-builder/history/ResumeHistoryMobileActions";
import ResumeDeleteDialog from "../../components/resume-builder/history/ResumeDeleteDialog";
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
// API responses can be returned directly, in Axios' `data`, or wrapped
// one additional time by the backend response envelope.
const getPayload = (response) =>
  response?.data?.data ?? response?.data ?? response;

const getResumeList = (response) => {
  const payload = getPayload(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.resumes)) return payload.resumes;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const unwrap = (response) => {
  const candidates = [
    response?.data?.data,
    response?.data?.resume,
    response?.data,
    response?.resume,
    response,
  ];
  return candidates.find(
    (candidate) =>
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate) &&
      (candidate.profile || candidate.personalInfo),
  ) || null;
};
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
  const historyRequestRef = useRef(0);
  const detailRequestRef = useRef(0);
  const mountedRef = useRef(true);
  const dirty =
    editing && JSON.stringify(draft) !== JSON.stringify(originalDraft);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      historyRequestRef.current += 1;
      detailRequestRef.current += 1;
    };
  }, []);

  const selectedIdRef = useRef(selectedId);

  // Keep the latest selection available to async history refreshes without
  // mutating a ref during render.
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const loadHistory = useCallback(async (preferredId) => {
    const requestId = ++historyRequestRef.current;
    try {
      const response = await getResumes();
      if (!mountedRef.current || requestId !== historyRequestRef.current) return [];
      setError("");
      const rows = getResumeList(response);
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
      if (mountedRef.current && requestId === historyRequestRef.current) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Could not load your saved resumes.",
        );
      }
      return [];
    } finally {
      if (mountedRef.current && requestId === historyRequestRef.current) setLoadingList(false);
    }
  }, []);

  const loadDetail = useCallback(async (id) => {
    if (!id) return;
    const requestId = ++detailRequestRef.current;
    try {
      const response = await getResumeById(id);
      if (!mountedRef.current || requestId !== detailRequestRef.current) return;
      setError("");
      const resume = unwrap(response);
      if (!resume) throw new Error("The selected resume could not be read.");
      setSelectedResume(resume);
      const normalized = normalize(resume);
      setDraft(clone(normalized));
      setOriginalDraft(clone(normalized));
    } catch (err) {
      if (mountedRef.current && requestId === detailRequestRef.current) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Could not load this resume.",
        );
      }
    } finally {
      if (mountedRef.current && requestId === detailRequestRef.current) setLoadingDetail(false);
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
  const displayName =
    profile.name?.trim() ||
    profile.title?.trim() ||
    profile.headline?.trim() ||
    (selectedId ? "Untitled resume" : "Scorer Workspace");
  const detailSections = createResumeDetailSections(data);

  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const [mobilePreviewPanelOpen, setMobilePreviewPanelOpen] = useState(false);

  const historySidebarProps = {
    loadHistory, selectedId, loadingList, history, query, setQuery, setHistoryPage,
    filtered, pagedHistory, dateLabel, navigate, chooseResume, mobileHistoryOpen, setMobileHistoryOpen,
    historyPage, historyPages,
  };

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
        .rio-resume-history .rio-mobile-content { padding-left: 16px; padding-right: 16px; padding-bottom: calc(6.5rem + env(safe-area-inset-bottom)); padding-top: clamp(1rem, 3vh, 1.5rem); }
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
        <ResumeHistorySidebar {...historySidebarProps} />
        {mobileHistoryOpen && (
          <button
            type="button"
            aria-label="Close resume history"
            onClick={() => setMobileHistoryOpen(false)}
            className="absolute inset-0 z-40 backdrop-blur-xl bg-black/45 lg:hidden"
          />
        )}

        {/* CENTER: the roadmap detail page's central workspace rhythm */}
        <ResumeHistoryWorkspace
          navigate={navigate}
          displayName={displayName}
          setDeleteOpen={setDeleteOpen}
          deleting={deleting}
          error={error}
          notice={notice}
          setError={setError}
          setNotice={setNotice}
          selectedId={selectedId}
          loadingDetail={loadingDetail}
          selectedResume={selectedResume}
          editing={editing}
          cancelEdit={cancelEdit}
          startEdit={startEdit}
          data={data}
          setDraft={setDraft}
          normalize={normalize}
          dirty={dirty}
          detailSections={detailSections}
          profile={profile}
        />

        {mobilePreviewPanelOpen && (
          <button
            type="button"
            aria-label="Close resume preview panel"
            onClick={() => setMobilePreviewPanelOpen(false)}
            className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-sm lg:hidden"
          />
        )}
        <ResumeHistoryPreviewPanel
          TEMPLATES={TEMPLATES}
          template={template}
          setTemplate={setTemplate}
          selectedResume={selectedResume}
          draft={draft}
          data={draft}
          resumeTheme={resumeTheme}
          resumePrintRef={resumePrintRef}
          TemplateComponent={TemplateComponent}
          setPreviewOpen={setPreviewOpen}
          saveChanges={saveChanges}
          selectedId={selectedId}
          dirty={dirty}
          saving={saving}
          deleting={deleting}
          setDeleteOpen={setDeleteOpen}
          mobileOpen={mobilePreviewPanelOpen}
        />
      </div>

      <ResumeHistoryMobileActions
        selectedId={selectedId}
        editing={editing}
        selectedResume={selectedResume}
        mobileHistoryOpen={mobileHistoryOpen}
        setPreviewOpen={setPreviewOpen}
        setMobileHistoryOpen={setMobileHistoryOpen}
        setMobilePreviewPanelOpen={setMobilePreviewPanelOpen}
        saveChanges={saveChanges}
        dirty={dirty}
        saving={saving}
        startEdit={startEdit}
        cancelEdit={cancelEdit}
        loadingDetail={loadingDetail}
        navigate={navigate}
      />
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
      <ResumeDeleteDialog
        open={deleteOpen}
        displayName={displayName}
        deleting={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={removeResume}
      />
    </div>
  );
}
