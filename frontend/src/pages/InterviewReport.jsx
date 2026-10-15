import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiChevronDown,
  FiTarget,
  FiTrendingUp,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { deleteInterview, getInterview } from "../api/interview.api";

export default function InterviewReport({
  interviewId: interviewIdProp,
  initialInterview = null,
  onDeleted,
  embedded = false,
  deleteRequest = false,
  onDeleteRequestHandled,
}) {
  const { interviewId: routeInterviewId } = useParams();
  const navigate = useNavigate();
  const interviewId = interviewIdProp || routeInterviewId;
  const [fetchedInterview, setFetchedInterview] = useState(initialInterview);
  const [fetchedInterviewId, setFetchedInterviewId] = useState(null);
  const interview =
    fetchedInterviewId === interviewId && fetchedInterview
      ? fetchedInterview
      : initialInterview;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchReport = async () => {
      if (!interviewId) {
        setError("Interview ID is missing.");
        setLoading(false);
        return;
      }
      setError("");
      setExpandedQuestion(null);
      try {
        const result = await getInterview(interviewId);
        if (!result?.success || !result?.data)
          throw new Error(
            result?.message || "Unable to load interview report.",
          );
        if (!cancelled) {
          setFetchedInterview(result.data);
          setFetchedInterviewId(interviewId);
        }
      } catch (err) {
        if (!cancelled)
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load this interview report.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchReport();
    return () => {
      cancelled = true;
    };
  }, [interviewId, reloadKey]);

  const formatScore = (value) =>
    value === null ||
    value === undefined ||
    value === "" ||
    !Number.isFinite(Number(value))
      ? "—"
      : `${Number(value).toFixed(1)}/10`;
  const formatDate = (value) => {
    if (!value) return "Unknown date";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Unknown date"
      : date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };
  const formatTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
        });
  };
  const formatType = (type) =>
    ({
      coding: "Coding",
      dsa: "DSA",
      core: "Core CS",
      development: "Development",
      project: "Project",
      "system-design": "System Design",
      behavioral: "Behavioral",
      full: "Full Interview",
    })[type] ||
    type ||
    "Interview";
  const formatSection = (value) =>
    value
      ? value
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase())
      : "General";
  const sectionScores = useMemo(() => {
    if (!interview?.sectionScores) return [];
    if (interview.sectionScores instanceof Map)
      return Array.from(interview.sectionScores.entries());
    return typeof interview.sectionScores === "object"
      ? Object.entries(interview.sectionScores)
      : [];
  }, [interview]);

  const questions = Array.isArray(interview?.questions)
    ? interview.questions
    : [];

  const answered = questions.filter(
    (q) => q?.submittedAt || q?.answer?.trim(),
  ).length;

  const evaluated = questions.filter(
    (q) => q?.evaluation && Number.isFinite(Number(q.evaluation.score)),
  );

  const questionStats = {
    total: questions.length,
    answered,
    evaluated: evaluated.length,
    average: evaluated.length
      ? evaluated.reduce((sum, q) => sum + Number(q.evaluation.score), 0) /
        evaluated.length
      : null,
  };

  const overallScore =
    interview?.overallScore === null ||
    interview?.overallScore === undefined ||
    interview?.overallScore === ""
      ? NaN
      : Number(interview.overallScore);
  const validScore = Number.isFinite(overallScore);
  const scorePercent = validScore
    ? Math.min(Math.max(overallScore * 10, 0), 100)
    : 0;
  const completed = interview?.status === "completed";
  const tone = (score) => {
    const value = Number(score);
    if (!Number.isFinite(value)) return "bg-white/40";
    if (value >= 7) return "bg-emerald-400";
    if (value >= 4) return "bg-amber-300";
    return "bg-rose-400";
  };

  const deleteInterviewNow = async () => {
    if (!interviewId || deleting) return;
    try {
      setDeleting(true);
      setDeleteError("");
      const result = await deleteInterview(interviewId);
      if (!result?.success)
        throw new Error(result?.message || "Unable to delete this interview.");
      setShowDeleteModal(false);
      onDeleteRequestHandled?.();
      if (typeof onDeleted === "function") {
        onDeleted(interviewId);
        return;
      }
      navigate("/mock-interview/history", { replace: true });
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete this interview.",
      );
    } finally {
      setDeleting(false);
    }
  };
  const closeDelete = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setDeleteError("");
    onDeleteRequestHandled?.();
  };

  if (!interviewId) return null;
  if (loading && !interview)
    return (
      <div className="px-5 py-20">
        <div className="mx-auto max-w-3xl animate-pulse">
          <div className="h-3 w-28 rounded bg-white/[.07]" />
          <div className="mt-5 h-10 w-2/3 rounded bg-white/[.07]" />
          <div className="mt-7 h-32 rounded-2xl bg-white/[.04]" />
          <div className="mt-4 h-48 rounded-2xl bg-white/[.04]" />
        </div>
      </div>
    );
  if (!interview)
    return (
      <div className="flex min-h-full items-center justify-center px-5 py-16 text-white">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[.04]">
            <FiAlertCircle size={18} />
          </div>
          <h1 className="mt-4 text-lg font-semibold">Unable to load report</h1>
          <p className="mt-2 text-sm leading-6 text-[#858994]">
            {error || "Something went wrong while loading this report."}
          </p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="mt-5 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-[#17191C]"
          >
            Try again
          </button>
        </div>
      </div>
    );

  return (
    <div
      className={`rio-report-page min-h-full text-white ${embedded ? "bg-transparent" : "bg-[#17191C]"}`}
    >
      <style>{`
      @keyframes rioReportEnter{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
      .rio-report-section{animation:rioReportEnter 300ms cubic-bezier(.22,1,.36,1) both}
      @media(prefers-reduced-motion:reduce){.rio-report-section{animation:none!important;transition:none!important}}
    `}</style>
      <div
        className={`mx-auto w-full px-4 pb-8 pt-5 sm:px-6 lg:px-8 ${embedded ? "max-w-none" : "max-w-[1500px]"}`}
      >
        {!embedded && (
          <div className="mb-5 border-b border-white/[.08] pb-4">
            <button
              type="button"
              onClick={() => navigate("/mock-interview")}
              className="inline-flex items-center gap-2 text-xs text-[#858994] transition hover:text-white"
            >
              <FiArrowLeft size={14} />
              Mock Interviews
            </button>
          </div>
        )}
        <header className="rio-report-section mb-7 border-b border-white/[.08] pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[.22em] text-[#777B85]">
                Your interview review
              </p>
              <h1 className="mt-2 max-w-3xl text-[27px] font-semibold leading-[1.12] tracking-[-.045em] sm:text-[34px]">
                {interview.role || "Mock Interview"}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[11px] text-[#858994]">
                <span>{formatType(interview.interviewType)}</span>
                <span className="text-white/20">·</span>
                <span>
                  {formatDate(interview.createdAt || interview.startedAt)}
                </span>
                {formatTime(interview.createdAt || interview.startedAt) && (
                  <>
                    <span className="text-white/20">·</span>
                    <span>
                      {formatTime(interview.createdAt || interview.startedAt)}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-white/[.10] bg-white/[.025] px-3.5 py-2 text-[11px] font-semibold text-[#D4D4D8] transition hover:bg-white/[.07]"
              >
                <FiTrash2 size={13} />
                Delete
              </button>
              <button
                type="button"
                onClick={() => navigate("/mock-interview/new")}
                className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-[11px] font-semibold text-[#17191C] transition hover:bg-[#E7E7E7]"
              >
                Interview again <FiArrowRight size={13} />
              </button>
            </div>
          </div>
          {!completed && (
            <div className="mt-5 flex items-start gap-3 border-l-2 border-amber-300/70 bg-white/[.025] px-4 py-3 text-xs leading-5 text-[#BFC0C5]">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
              <p>
                This interview is not marked as completed. Some evaluation data
                may still be missing.
              </p>
            </div>
          )}
        </header>

        <section className="rio-report-section rounded-2xl border border-white/[.09] bg-white/[.025] p-4 sm:p-6 grid gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 items-center gap-4 sm:gap-7">
            <div className="relative h-[100px] w-[100px] shrink-0 sm:h-[128px] sm:w-[128px]">
              <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  fill="none"
                  stroke="rgba(255,255,255,.08)"
                  strokeWidth="7"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  fill="none"
                  stroke={
                    !validScore
                      ? "rgba(255,255,255,.35)"
                      : overallScore < 5
                        ? "#FB7185"
                        : overallScore < 8
                          ? "#FBBF24"
                          : "#34D399"
                  }
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 * (1 - scorePercent / 100)}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[30px] font-semibold leading-none tracking-[-.06em] sm:text-[34px]">
                  {validScore ? overallScore.toFixed(1) : "—"}
                </span>
                <span className="mt-1 text-[10px] text-[#858994]">
                  out of 10
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-[#777B85]">
                Overall performance
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-[-.025em]">
                {validScore
                  ? overallScore >= 8
                    ? "Strong performance"
                    : overallScore >= 6
                      ? "Good foundation"
                      : overallScore >= 4
                        ? "Room to improve"
                        : "Keep building"
                  : "Score unavailable"}
              </h2>
              <p className="mt-2 max-w-sm text-[11px] leading-5 text-[#858994] sm:text-xs">
                Your overall result from the evaluations recorded for this
                round.
              </p>
              <div className="mt-3">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-medium capitalize ${
                    completed
                      ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                      : "border-amber-300/20 bg-amber-300/[0.08] text-amber-200"
                  }`}
                >
                  {String(interview.status || "status unavailable").replace(
                    /[-_]/g,
                    " ",
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/[.07] pt-4 sm:gap-x-5 md:self-center md:border-l md:border-t-0 md:pl-6 md:pt-0">
            {[
              ["Questions", questionStats.total, <FiBarChart2 size={13} />],
              ["Answered", questionStats.answered, <FiCheckCircle size={13} />],
              ["Evaluated", questionStats.evaluated, <FiTarget size={13} />],
              [
                "Avg. question",
                formatScore(questionStats.average),
                <FiTrendingUp size={13} />,
              ],
            ].map(([label, value, icon]) => (
              <div key={label} className="min-w-0">
                <div className="flex items-center gap-2 text-[#777B85]">
                  {icon}
                  <span className="truncate text-[9px] font-semibold uppercase tracking-[.12em]">
                    {label}
                  </span>
                </div>
                <p className="mt-1.5 text-lg font-semibold tracking-[-.03em]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {sectionScores.length > 0 && (
          <section className="rio-report-section mt-5 rounded-2xl border border-white/[.09] bg-white/[.018] p-4 sm:mt-6 sm:p-6">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-[#777B85]">
                  Performance breakdown
                </p>
                <h2 className="mt-1.5 text-lg font-semibold tracking-[-.03em]">
                  Section scores
                </h2>
              </div>
              <span className="text-[10px] text-[#62656D]">
                {sectionScores.length} sections
              </span>
            </div>
            <div className="space-y-4">
              {sectionScores.map(([section, value]) => {
                const n = Number(value),
                  width = Number.isFinite(n)
                    ? Math.max(0, Math.min(100, n * 10))
                    : 0;
                return (
                  <div key={section}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-[#D4D4D8]">
                        {formatSection(section)}
                      </span>
                      <span className="text-xs font-semibold tabular-nums">
                        {formatScore(value)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[.08]">
                      <div
                        className="h-full rounded-full bg-white/80 transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {interview.summary && (
          <section className="rio-report-section mt-5 rounded-2xl border border-white/[.09] bg-white/[.025] p-4 sm:mt-6 sm:p-6">
            <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-[#777B85]">
              Executive summary
            </p>
            <p className="mt-3 max-w-4xl whitespace-pre-wrap text-sm leading-7 text-[#D4D4D8]">
              {interview.summary}
            </p>
          </section>
        )}

        <section className="rio-report-section mt-5 grid gap-4 md:grid-cols-2 sm:mt-6">
          <div className="rounded-2xl border border-white/[.09] bg-white/[.018] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <h2 className="text-base font-semibold">Strengths</h2>
            </div>
            <p className="mt-1 text-[10px] text-[#777B85]">
              What worked well in this round
            </p>
            {Array.isArray(interview.strengths) &&
            interview.strengths.length ? (
              <ul className="mt-4 space-y-3">
                {interview.strengths.map((item, i) => (
                  <li
                    key={`${item}-${i}`}
                    className="flex gap-2.5 text-xs leading-6 text-[#C9CBD0]"
                  >
                    <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-xs text-[#71717A]">
                No strengths were recorded.
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-white/[.09] bg-white/[.018] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              <h2 className="text-base font-semibold">Areas to improve</h2>
            </div>
            <p className="mt-1 text-[10px] text-[#777B85]">
              The most useful opportunities for your next round
            </p>
            {Array.isArray(interview.weaknesses) &&
            interview.weaknesses.length ? (
              <ul className="mt-4 space-y-3">
                {interview.weaknesses.map((item, i) => (
                  <li
                    key={`${item}-${i}`}
                    className="flex gap-2.5 text-xs leading-6 text-[#C9CBD0]"
                  >
                    <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-amber-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-xs text-[#71717A]">
                No improvement areas were recorded.
              </p>
            )}
          </div>
        </section>

        {Array.isArray(interview.recommendations) &&
          interview.recommendations.length > 0 && (
            <section className="rio-report-section mt-5 rounded-2xl border border-white/[.09] bg-white/[.018] p-4 sm:mt-6 sm:p-6">
              <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-[#777B85]">
                Recommended next steps
              </p>
              <h2 className="mt-1.5 text-lg font-semibold">
                Turn feedback into progress
              </h2>
              <ol className="mt-4 divide-y divide-white/[.07]">
                {interview.recommendations.map((item, i) => (
                  <li
                    key={`${item}-${i}`}
                    className="flex gap-3 py-3.5 first:pt-0"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[.12] text-[10px] font-semibold text-[#BFC1C7]">
                      {i + 1}
                    </span>
                    <p className="pt-0.5 text-xs leading-6 text-[#D4D4D8]">
                      {item}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}

        <section className="rio-report-section mt-5 rounded-2xl border border-white/[.09] bg-white/[.018] p-4 sm:mt-6 sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-[#777B85]">
                Detailed review
              </p>
              <h2 className="mt-1.5 text-lg font-semibold tracking-[-.03em]">
                Question-by-question analysis
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-[#777B85]">
                Open any question to review your answer, evaluation and
                feedback.
              </p>
            </div>
            <span className="text-[10px] text-[#62656D]">
              {questions.length} questions
            </span>
          </div>
          {questions.length === 0 ? (
            <p className="border-y border-white/[.07] py-8 text-center text-xs text-[#777B85]">
              No questions are available for this report.
            </p>
          ) : (
            <div className="divide-y divide-white/[.07] border-y border-white/[.07]">
              {questions.map((question, index) => {
                const evaluation = question.evaluation || {},
                  key = question.questionId || index,
                  expanded = expandedQuestion === key;
                const metrics = [
                  ["Score", evaluation.score],
                  ["Correctness", evaluation.correctness],
                  ["Clarity", evaluation.clarity],
                  ["Relevance", evaluation.relevance],
                  ["Communication", evaluation.communication],
                  ...(question.section === "coding"
                    ? [
                        ["Logic", evaluation.logic],
                        ["Complexity", evaluation.complexity],
                        ["Edge cases", evaluation.edgeCases],
                        ["Code quality", evaluation.codeQuality],
                      ]
                    : []),
                ].filter(([, v]) => v !== undefined && v !== null && v !== "");
                return (
                  <article key={key}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() =>
                        setExpandedQuestion((prev) =>
                          prev === key ? null : key,
                        )
                      }
                      className="flex w-full items-center gap-3 py-4 text-left transition hover:bg-white/[.02]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[.09] bg-white/[.025] text-[10px] font-semibold text-[#A1A1AA]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[.1em] text-[#777B85]">
                          <span>{formatSection(question.section)}</span>
                          {question.difficulty && (
                            <>
                              <span className="text-white/20">·</span>
                              <span>{question.difficulty}</span>
                            </>
                          )}
                        </span>
                        <span className="mt-1 block line-clamp-2 text-xs font-medium leading-5 text-[#D4D4D8]">
                          {question.text || "Question details unavailable"}
                        </span>
                      </span>
                      <span className="hidden shrink-0 items-center gap-2 sm:flex">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${tone(evaluation.score)}`}
                        />
                        <span className="text-xs font-semibold tabular-nums">
                          {formatScore(evaluation.score)}
                        </span>
                      </span>
                      <FiChevronDown
                        size={15}
                        className={`shrink-0 text-[#777B85] transition-transform ${expanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {expanded && (
                      <div className="pb-5 pl-0 sm:pl-11">
                        {metrics.length > 0 && (
                          <div className="mb-5 flex flex-wrap gap-x-5 gap-y-3">
                            {metrics.map(([label, value]) => (
                              <div key={label} className="min-w-[70px]">
                                <p className="text-[9px] uppercase tracking-[.12em] text-[#777B85]">
                                  {label}
                                </p>
                                <p className="mt-1 text-xs font-semibold">
                                  {formatScore(value)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="border-l border-white/[.12] pl-4">
                          <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#777B85]">
                            Your answer
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-[#C9CBD0]">
                            {question.answer?.trim() || "No answer submitted."}
                          </p>
                        </div>
                        {evaluation.feedback && (
                          <div className="mt-5 border-l border-white/[.12] pl-4">
                            <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#777B85]">
                              Interviewer feedback
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-[#C9CBD0]">
                              {evaluation.feedback}
                            </p>
                          </div>
                        )}
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                          {[
                            ["Strengths", evaluation.strengths],
                            ["Areas to improve", evaluation.weaknesses],
                          ].map(([title, items]) => (
                            <div key={title}>
                              <p className="text-[9px] font-semibold uppercase tracking-[.15em] text-[#777B85]">
                                {title}
                              </p>
                              {Array.isArray(items) && items.length ? (
                                <ul className="mt-3 space-y-2">
                                  {items.map((item, i) => (
                                    <li
                                      key={`${item}-${i}`}
                                      className="flex gap-2 text-xs leading-5 text-[#C9CBD0]"
                                    >
                                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-white/50" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="mt-2 text-[11px] text-[#62656D]">
                                  No details recorded.
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                        {evaluation.betterAnswer && (
                          <div className="mt-5 border-l border-white/[.12] pl-4">
                            <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#777B85]">
                              A stronger answer
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-[#C9CBD0]">
                              {evaluation.betterAnswer}
                            </p>
                          </div>
                        )}
                        {Array.isArray(evaluation.recommendations) &&
                          evaluation.recommendations.length > 0 && (
                            <div className="mt-5">
                              <p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#777B85]">
                                How to improve
                              </p>
                              <ul className="mt-3 space-y-2">
                                {evaluation.recommendations.map((item, i) => (
                                  <li
                                    key={`${item}-${i}`}
                                    className="flex gap-2 text-xs leading-5 text-[#C9CBD0]"
                                  >
                                    <span className="text-[#858994]">
                                      {i + 1}.
                                    </span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/[.08] pt-5">
          <div>
            <p className="text-sm font-semibold">Ready for another round?</p>
            <p className="mt-1 text-xs text-[#777B85]">
              Use what you learned to make your next attempt stronger.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/mock-interview/new")}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-[#E7E7E7]"
          >
            Interview again <FiArrowRight size={13} />
          </button>
        </div>
      </div>

      {(showDeleteModal || deleteRequest) &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-interview-title"
          >
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#191B1E]/95 p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="delete-interview-title"
                    className="text-base font-semibold"
                  >
                    Delete interview?
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-[#858994]">
                    This action cannot be undone. Your interview, saved answers,
                    evaluations, score, and report will be permanently deleted
                    from your history.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDelete}
                  disabled={deleting}
                  aria-label="Close"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-[#858994] transition hover:bg-white/[.08] disabled:opacity-50"
                >
                  <FiX size={15} />
                </button>
              </div>
              {deleteError && (
                <p className="mt-4 rounded-xl border border-white/[.08] px-3 py-2.5 text-xs leading-5 text-[#D4D4D8]">
                  {deleteError}
                </p>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeDelete}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs font-medium hover:bg-white/[.08] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deleteInterviewNow}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#111214] hover:bg-[#EDEDEF] disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
