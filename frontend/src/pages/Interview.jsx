import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiLoader,
} from "react-icons/fi";

import { RiBrainAi3Fill } from "react-icons/ri";

import {
  getInterview,
  getNextQuestion,
  getPreviousQuestion,
  quitInterview,
  submitInterview,
} from "../api/interview.api";

const Interview = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [answer, setAnswer] = useState("");
  const [draftAnswers, setDraftAnswers] = useState({});
  const draftAnswersRef = useRef({});

  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [finalSubmitting, setFinalSubmitting] = useState(false);
  const [quitting, setQuitting] = useState(false);

  const [error, setError] = useState("");
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] =
    useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(true);

  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const autoSubmitTriggeredRef = useRef(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  /*
   * ---------------------------------------------------------
   * Load interview
   * ---------------------------------------------------------
   */

  const loadInterview = useCallback(async () => {
    try {
      setError("");

      const result = await getInterview(interviewId);

      if (!result?.success || !result?.data) {
        throw new Error(result?.message || "Unable to load this interview.");
      }

      const data = result.data;
      autoSubmitTriggeredRef.current = false;

      /*
       * Completed interviews go directly to report.
       */
      if (data.status === "completed") {
        navigate(`/mock-interview/${interviewId}/report`, {
          replace: true,
        });

        return;
      }

      setInterview(data);

      /*
       * Set answer directly here.
       *
       * No useEffect is needed for answer synchronization.
       */
      const loadedQuestion = Array.isArray(data.questions)
        ? data.questions[data.currentQuestionIndex]
        : null;

      setAnswer(
        draftAnswersRef.current[loadedQuestion?.questionId] ??
          loadedQuestion?.answer ??
          "",
      );

      if (data.status === "abandoned") {
        setError("This interview has been abandoned.");
      }
    } catch (err) {
      console.error("Failed to load interview:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load this interview.",
      );
    } finally {
      setLoading(false);
    }
  }, [interviewId, navigate]);

  /*
   * The timeout keeps the initial mount effect free from
   * synchronous state-update warnings.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadInterview();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadInterview]);

  /*
   * ---------------------------------------------------------
   * Current question
   * ---------------------------------------------------------
   */

  const currentQuestion = useMemo(() => {
    if (!interview || !Array.isArray(interview.questions)) {
      return null;
    }

    return interview.questions[interview.currentQuestionIndex] || null;
  }, [interview]);

  /*
   * ---------------------------------------------------------
   * Interview state
   * ---------------------------------------------------------
   */

  const isAbandoned = interview?.status === "abandoned";
  const isCompleted = interview?.status === "completed";

  /*
   * ---------------------------------------------------------
   * Progress
   * ---------------------------------------------------------
   */

  const questionNumber = interview
    ? (interview.currentQuestionIndex || 0) + 1
    : 0;

  const totalQuestions = interview?.questions?.length || 0;

  const answeredQuestions =
    interview?.questions?.filter(
      (question) =>
        draftAnswers[question.questionId]?.trim() || question.answer?.trim(),
    ).length || 0;

  const isLastQuestion = questionNumber === totalQuestions;

  const canSubmitFinal =
    totalQuestions > 0 && interview?.status === "in-progress";

  /*
   * ---------------------------------------------------------
   * Timer
   * ---------------------------------------------------------
   */

  const formatTime = (seconds) => {
    if (seconds === null) {
      return "--:--";
    }

    const safeSeconds = Math.max(0, seconds);

    const minutes = Math.floor(safeSeconds / 60);
    const remaining = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
      2,
      "0",
    )}`;
  };

  /*
   * ---------------------------------------------------------
   * Refresh interview
   * ---------------------------------------------------------
   */

  const refreshInterview = useCallback(async () => {
    const result = await getInterview(interviewId);

    if (!result?.success || !result?.data) {
      throw new Error("Unable to refresh the interview.");
    }

    if (result.data.status === "completed") {
      navigate(`/mock-interview/${interviewId}/report`, {
        replace: true,
      });

      return null;
    }

    setInterview(result.data);

    const refreshedQuestion = Array.isArray(result.data.questions)
      ? result.data.questions[result.data.currentQuestionIndex]
      : null;

    setAnswer(
      draftAnswersRef.current[refreshedQuestion?.questionId] ??
        refreshedQuestion?.answer ??
        "",
    );

    return result.data;
  }, [interviewId, navigate]);

  /*
   * ---------------------------------------------------------
   * Next question
   * ---------------------------------------------------------
   */

  const handleNextQuestion = async () => {
    if (!interview || navigating  || isAbandoned || isLastQuestion) {
      return;
    }

    try {
      setNavigating(true);
      setError("");

      const result = await getNextQuestion(interviewId);

      if (!result?.success || !result?.data) {
        throw new Error(
          result?.message || "Unable to move to the next question.",
        );
      }

      const nextIndex = result.data.currentQuestionIndex;

      const nextQuestion = interview.questions?.[nextIndex];

      setInterview((currentInterview) => {
        if (!currentInterview) {
          return currentInterview;
        }

        return {
          ...currentInterview,
          currentQuestionIndex: nextIndex,
        };
      });

      setAnswer(
        draftAnswersRef.current[nextQuestion?.questionId] ??
          nextQuestion?.answer ??
          "",
      );
    } catch (err) {
      console.error("Failed to move to next question:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to move to the next question.",
      );
    } finally {
      setNavigating(false);
    }
  };
  /*
   * ---------------------------------------------------------
   * Previous question
   * ---------------------------------------------------------
   */

  const handlePreviousQuestion = async () => {
    if (!interview || navigating || isAbandoned || questionNumber <= 1) {
      return;
    }

    try {
      setNavigating(true);
      setError("");

      const result = await getPreviousQuestion(interviewId);

      if (!result?.success || !result?.data) {
        throw new Error(
          result?.message || "Unable to move to the previous question.",
        );
      }

      const updatedInterview = result.data;

      setInterview(updatedInterview);

      const previousQuestion = Array.isArray(updatedInterview.questions)
        ? updatedInterview.questions[updatedInterview.currentQuestionIndex]
        : null;

      setAnswer(
        draftAnswersRef.current[previousQuestion?.questionId] ??
          previousQuestion?.answer ??
          "",
      );
    } catch (err) {
      console.error("Failed to move to previous question:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to move to the previous question.",
      );
    } finally {
      setNavigating(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Jump to question
   * ---------------------------------------------------------
   */

  const handleQuestionJump = (index) => {
    if (
      !interview ||
      navigating ||
      isAbandoned ||
      index === interview.currentQuestionIndex ||
      index < 0 ||
      index >= interview.questions.length
    ) {
      return;
    }

    setError("");

    const jumpedQuestion = interview.questions[index];

    setInterview((previous) => ({
      ...previous,
      currentQuestionIndex: index,
    }));

    setAnswer(
      draftAnswersRef.current[jumpedQuestion?.questionId] ??
        jumpedQuestion?.answer ??
        "",
    );
  };

  /*
   * ---------------------------------------------------------
   * Final submit
   * ---------------------------------------------------------
   */
  const handleSubmitInterview = useCallback(
    async ({ automatic = false } = {}) => {
      if (
        !interview ||
        finalSubmitting ||
        navigating ||
        quitting ||
        isAbandoned ||
        isCompleted
      ) {
        return;
      }

      /*
       * Automatic timer submission must never show a confirmation
       * dialog.
       */
      if (!automatic) {
        setShowSubmitModal(true);
        return;
      }

      try {
        setFinalSubmitting(true);
        setError("");
        setShowInsufficientBalanceModal(false);
        setReportReady(false);
        setShowCompletionModal(true);

        const finalDraftAnswers = {
          ...draftAnswersRef.current,
        };

        if (currentQuestion?.questionId) {
          finalDraftAnswers[currentQuestion.questionId] = answer;
        }

        const result = await submitInterview(interviewId, finalDraftAnswers);

        if (!result?.success) {
          throw new Error(result?.message || "Unable to submit the interview.");
        }

        /*
         * Backend successfully finalized the interview
         * and the report is now ready.
         */
        if (
          result?.data?.status === "completed" ||
          result?.data?.interview?.status === "completed"
        ) {
          setReportReady(true);

          return;
        }
        if (
          result?.data?.status === "abandoned" ||
          result?.data?.interview?.status === "abandoned"
        ) {
          await refreshInterview();
          return;
        }

        /*
         * Defensive fallback:
         * refresh the interview in case the API response does
         * not directly contain the completed interview.
         */
        const refreshed = await refreshInterview();

        if (refreshed?.status === "completed") {
          setReportReady(true);
        }
      } catch (err) {
        console.error(
          automatic
            ? "Automatic interview submission failed:"
            : "Failed to submit interview:",
          err,
        );

        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to submit the interview. Please try again.";

        if (
          errorMessage.toLowerCase().includes("insufficient") &&
          errorMessage.toLowerCase().includes("coin")
        ) {
          setShowInsufficientBalanceModal(true);
          setError("");
        } else {
          setError(errorMessage);
        }

        try {
          await refreshInterview();
        } catch {
          // Keep the original submit error visible.
        }
      } finally {
        setFinalSubmitting(false);
      }
    },
    [
      interview,
      finalSubmitting,
      navigating,
      quitting,
      isAbandoned,
      isCompleted,
      interviewId,
      refreshInterview,
      answer,
      currentQuestion,
    ],
  );

  const handleConfirmSubmitInterview = useCallback(async () => {
    setShowSubmitModal(false);

    await handleSubmitInterview({
      automatic: true,
    });
  }, [handleSubmitInterview]);

  useEffect(() => {
    if (!interview?.startedAt || isAbandoned || isCompleted) {
      const timer = window.setTimeout(() => {
        setRemainingSeconds(null);
      }, 0);

      return () => window.clearTimeout(timer);
    }

    const updateTimer = () => {
      const startedAt = new Date(interview.startedAt).getTime();

      const duration = Number(interview.timeLimit || 30) * 60 * 1000;

      const deadline = startedAt + duration;

      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

      setRemainingSeconds(remaining);

      /*
       * -------------------------------------------------------
       * TIME LIMIT REACHED
       * -------------------------------------------------------
       *
       * Frontend automatically requests final submission.
       *
       * Backend remains the source of truth and will verify
       * the actual deadline before finalizing.
       */
      if (
        remaining === 0 &&
        !autoSubmitTriggeredRef.current &&
        !finalSubmitting &&
        !isAbandoned &&
        !isCompleted
      ) {
        autoSubmitTriggeredRef.current = true;

        handleSubmitInterview({
          automatic: true,
        });
      }
    };

    updateTimer();

    const interval = window.setInterval(updateTimer, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    interview?.startedAt,
    interview?.timeLimit,
    isAbandoned,
    isCompleted,
    finalSubmitting,
    handleSubmitInterview,
  ]);

  /*
   * ---------------------------------------------------------
   * Quit
   * ---------------------------------------------------------
   */

  const handleQuit = async () => {
    try {
      setQuitting(true);
      setError("");

      const result = await quitInterview(interviewId);

      if (!result?.success) {
        throw new Error(result?.message || "Unable to quit the interview.");
      }

      navigate("/mock-interview", {
        replace: true,
      });
    } catch (err) {
      console.error("Failed to quit interview:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to quit the interview.",
      );

      setQuitting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Browser Back protection
   *
   * Back never silently leaves an active interview.
   * It opens the quit confirmation instead.
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!interview || isAbandoned || isCompleted) {
      return;
    }

    const handlePopState = () => {
      window.history.pushState(
        { interviewGuard: true },
        "",
        window.location.href,
      );

      setShowQuitModal(true);
    };

    window.history.pushState(
      { interviewGuard: true },
      "",
      window.location.href,
    );

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [interview, isAbandoned, isCompleted]);

  /*
   * ---------------------------------------------------------
   * Loading
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111315] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />

          <p className="text-xs text-[#71717A]">Preparing your interview...</p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * Fatal error
   * ---------------------------------------------------------
   */

  if (!interview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111315] px-5 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.045] p-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#A1A1AA]">
            <FiAlertCircle size={18} />
          </div>

          <h1 className="mt-4 text-lg font-semibold">
            Unable to open interview
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#71717A]">
            {error || "Something went wrong while loading the interview."}
          </p>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadInterview();
            }}
            className="mt-5 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-[#17191C]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * Abandoned screen
   *
   * No resume.
   * No navigation.
   * No submit.
   * No quit.
   * ---------------------------------------------------------
   */

  if (isAbandoned) {
    return (
      <div className="min-h-screen bg-[#111315] px-5 py-10 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-2xl border border-white/10 bg-white/[0.045] p-7 text-center sm:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/[0.06] text-red-300">
              <FiAlertCircle size={20} />
            </div>

            <h1 className="mt-5 text-xl font-semibold">Interview abandoned</h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#71717A]">
              This interview has ended and cannot be resumed.
            </p>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                <FiCheckCircle size={21} className="text-emerald-400" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                Interview Submitted
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8B8F98]">
                We are processing your interview and preparing your detailed
                report.
              </p>

              <button
                type="button"
                disabled={!reportReady}
                onClick={() => {
                  if (!reportReady) {
                    return;
                  }

                  setShowCompletionModal(false);

                  navigate(`/mock-interview/history?interview=${interviewId}`, {
                    replace: true,
                  });
                }}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  reportReady
                    ? "bg-white text-[#17191C] hover:bg-white/90"
                    : "cursor-not-allowed bg-white/[0.08] text-[#71717A]"
                }`}
              >
                {reportReady ? (
                  <>
                    View Report
                    <FiArrowRight size={15} />
                  </>
                ) : (
                  <>
                    <FiLoader size={15} className="animate-spin" />
                    Processing...
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#17191C] text-white">
      {/* =====================================================
          FIXED TOP BAR
      ====================================================== */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[#111315]/95 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left — Interview identity */}
          <div className="flex min-w-0 items-center gap-3">
            {/* RIO mark */}
            <div className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] shadow-[0_0_30px_rgba(255,255,255,0.025)] sm:flex">
              <RiBrainAi3Fill size={14} className="text-[#D4D4D8]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-white">
                  {interview.role || "Mock Interview"}
                </p>

                <span className="hidden text-[#52525B] sm:inline">·</span>

                <p className="hidden truncate text-[11px] font-medium uppercase tracking-[0.14em] text-[#71717A] sm:block">
                  {interview.interviewType || "Interview"}
                </p>
              </div>

              <p className="mt-0.5 text-[10px] tracking-wide text-[#52525B]">
                RIO Interview Session
              </p>
            </div>
          </div>

          {/* Center — Question progress */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-3 md:flex">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#52525B]">
              Question
            </span>

            <span className="font-mono text-sm font-medium tracking-tight text-[#E4E4E7]">
              {Math.min(
                (interview.currentQuestionIndex || 0) + 1,
                interview.questions?.length || 0,
              )}
            </span>

            <span className="text-[#3F3F46]">/</span>

            <span className="font-mono text-sm text-[#71717A]">
              {interview.questions?.length || 0}
            </span>
          </div>

          {/* Right — Timer */}
          <div className="flex items-center gap-2">
            {/* Timer */}
            <div
              className={`flex h-10 items-center gap-2 rounded-xl border px-3 transition-all ${
                remainingSeconds !== null && remainingSeconds <= 60
                  ? "border-red-400/25 bg-red-400/[0.06] text-red-300 shadow-[0_0_24px_rgba(248,113,113,0.06)]"
                  : "border-white/[0.08] bg-white/[0.035] text-[#D4D4D8]"
              }`}
            >
              <FiClock size={13} className="opacity-70" />

              <span className="font-mono text-[13px] font-medium tracking-tight">
                {formatTime(remainingSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Ultra-subtle progress line */}
        <div className="h-px bg-white/[0.025]">
          <div
            className="h-full bg-white/20 transition-all duration-500"
            style={{
              width: `${
                interview.questions?.length
                  ? (((interview.currentQuestionIndex || 0) + 1) /
                      interview.questions.length) *
                    100
                  : 0
              }%`,
            }}
          />
        </div>
      </header>{" "}
      <main className="min-h-screen w-full px-4 pb-32 pt-20 sm:px-6 lg:px-8">
        {/* ===================================================
            DESKTOP QUESTION NAVIGATOR
        ==================================================== */}

        <div className="w-full">
          <div className="min-h-0 w-full overflow-y-auto pr-0 lg:pr-[304px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* ===================================================
            ERROR
        ==================================================== */}

            {error && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">
                <FiAlertCircle size={16} className="mt-0.5 shrink-0" />

                <p>{error}</p>
              </div>
            )}

            {/* ===================================================
            QUESTION
        ==================================================== */}

            <section className="relative mt-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035]">
              {/* Question ambient glow */}
              <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-white/[0.06] blur-[100px]" />

              <div className="relative px-6 py-5 sm:px-7 sm:py-6">
                {/* Question Number */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-[#52525B]">
                    Question {questionNumber}
                  </span>

                  <span className="font-mono text-[10px] text-[#52525B]">
                    {String(questionNumber).padStart(2, "0")} /{" "}
                    {String(totalQuestions).padStart(2, "0")}
                  </span>
                </div>

                {/* Question */}
                <h1 className="mt-4 w-full font-sans text-[12px] font-medium leading-[1.4] tracking-[-0.01em] text-[#F4F4F5] sm:text-[16px] lg:text-[22px]">
                  {currentQuestion?.text || "Question unavailable."}
                </h1>
              </div>
            </section>

            {/* ===================================================
            ANSWER
        ==================================================== */}

            {/* ===================================================
    PREMIUM ANSWER WORKSPACE
==================================================== */}

            <section className="relative mt-5 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0D0F12]/80 shadow-[0_30px_100px_rgba(0,0,0,0.18)]">
              {/* Editor glow */}
              <div className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-white/[0.025] blur-[100px]" />

              {/* Editor header */}
              <div className="relative flex items-start justify-between gap-4 border-b border-white/[0.06] px-6 py-5 sm:px-7">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/40" />

                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA]">
                      Your response
                    </p>
                  </div>

                  <p className="mt-2 max-w-xl text-[11px] leading-5 text-[#52525B]">
                    Structure your thoughts clearly. Explain your reasoning,
                    assumptions, and approach as you would in a real interview.
                  </p>
                </div>

                {answer.trim().length > 0 && (
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#71717A]">
                    Draft saved
                  </span>
                )}
              </div>

              {/* Writing area */}
              <div className="relative">
                <textarea
                  value={answer}
                  onChange={(e) => {
                    const value = e.target.value;

                    setAnswer(value);

                    if (currentQuestion?.questionId) {
                      draftAnswersRef.current[currentQuestion.questionId] =
                        value;

                      setDraftAnswers((previous) => ({
                        ...previous,
                        [currentQuestion.questionId]: value,
                      }));
                    }
                  }}
                  disabled={navigating || quitting || finalSubmitting}
                  placeholder="Start explaining your approach..."
                  className="min-h-[300px] w-full resize-none bg-transparent px-6 py-6 font-sans text-[14px] leading-7 tracking-[0.005em] text-[#E4E4E7] outline-none placeholder:text-[#3F3F46] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[360px] sm:px-7 sm:py-7"
                />

                {/* Bottom editor status */}
                <div className="flex items-center justify-between border-t border-white/[0.05] px-6 py-3.5 sm:px-7">
                  <span className="text-[9px] uppercase tracking-[0.16em] text-[#3F3F46]">
                    Interview response
                  </span>

                  <span className="font-mono text-[10px] text-[#52525B]">
                    {answer.trim().length} characters
                  </span>
                </div>
              </div>
            </section>
          </div>

          <aside className="fixed right-6 top-[88px] z-30 hidden w-[280px] lg:flex lg:flex-col">
            <div className="flex min-h-[520px] flex-col rounded-2xl border border-white/[0.08] bg-[#111315] p-4 lg:h-[calc(100vh-104px)]">
              {/* Sidebar Header */}
              <div className="mb-4 flex items-center justify-between px-1">
                <div>
                  <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                    Questions
                  </p>

                  <p className="mt-1 font-sans text-[13px] text-white/60">
                    {answeredQuestions} answered
                  </p>
                </div>

                <span className="font-sans text-[12px] text-white/35">
                  {questionNumber}/{totalQuestions}
                </span>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-3 gap-2">
                {interview.questions.map((question, index) => {
                  const number = index + 1;
                  const isActive = number === questionNumber;
                  const isAnswered =
                    draftAnswers[question.questionId]?.trim() ||
                    question.answer?.trim();

                  return (
                    <button
                      key={question._id || index}
                      type="button"
                      onClick={() => handleQuestionJump(index)}
                      disabled={navigating}
                      className={[
                        "flex h-10 items-center justify-center rounded-xl border font-sans text-[12px] font-semibold transition-all",
                        isActive
                          ? "border-white bg-white text-[#17191C]"
                          : isAnswered
                            ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                            : "border-white/[0.08] bg-white/[0.035] text-[#71717A] hover:bg-white/[0.07] hover:text-[#D4D4D8]",
                      ].join(" ")}
                    >
                      {number}
                    </button>
                  );
                })}
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Navigation */}
              <div className="border-t border-white/[0.07] pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handlePreviousQuestion}
                    disabled={questionNumber === 1}
                    className="flex h-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] font-sans text-[12px] font-semibold text-white/65 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ← Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={isLastQuestion}
                    className="flex h-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] font-sans text-[12px] font-semibold text-white/65 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>

                {/* Draft status */}
                <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center">
                  <p className="text-[10px] leading-5 text-[#52525B]">
                    Your answer is saved as a draft until you submit the
                    interview.
                  </p>
                </div>
                {isLastQuestion && (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    disabled={
                      !canSubmitFinal ||
                      finalSubmitting ||
                      navigating ||
                      quitting
                    }
                    className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.08] font-sans text-[13px] font-semibold text-white transition hover:bg-white/[0.13] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <FiCheck size={14} />
                    Submit Interview
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
      {/* =====================================================
          FIXED BOTTOM BAR
      ====================================================== */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#111315]/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:hidden">
        <div className="mx-auto max-w-[1100px]">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePreviousQuestion}
              disabled={
                navigating || finalSubmitting || quitting || questionNumber <= 1
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-[#D4D4D8] transition-colors hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft size={14} />

              <span className="hidden sm:inline">Previous</span>
            </button>

            <span className="text-[10px] uppercase tracking-[0.12em] text-[#52525B]">
              {questionNumber} / {totalQuestions}
            </span>

            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={
                navigating || finalSubmitting || quitting || isLastQuestion
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-[#D4D4D8] transition-colors hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">Next</span>

              <FiChevronRight size={14} />
            </button>
          </div>
          {isLastQuestion && (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              disabled={
                !canSubmitFinal || finalSubmitting || navigating || quitting
              }
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiCheck size={14} />
              Submit Interview
            </button>
          )}
        </div>
      </div>
      {showRulesModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#191B1E] p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#A1A1AA]">
              <FiCheckCircle size={18} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              Before you begin
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#71717A]">
              Please read these interview rules before continuing.
            </p>

            <div className="my-5 space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-xs leading-5 text-[#A1A1AA]">
                • Your answers are saved as drafts while you move between
                questions.
              </p>

              <p className="text-xs leading-5 text-[#A1A1AA]">
                • Next and Previous do not submit or evaluate your answer.
              </p>

              <p className="text-xs leading-5 text-[#A1A1AA]">
                • Final submission evaluates all non-empty answers.
              </p>

              <p className="text-xs leading-5 text-[#A1A1AA]">
                • When the timer reaches 00:00, the interview is automatically
                submitted.
              </p>

              <p className="text-xs leading-5 text-[#A1A1AA]">
                • If you submit without answering anything, the interview is
                abandoned and no coins are charged.
              </p>

              <p className="text-xs leading-5 text-[#A1A1AA]">
                • Quitting the interview abandons this attempt and does not
                create a completed report or history entry.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="w-full rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-white/90"
            >
              I Understand & Continue
            </button>
          </div>
        </div>
      )}
      {showCompletionModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#191B1E] p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
              <FiCheckCircle size={22} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              Interview Completed
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#A1A1AA]">
              100 coins charged for this interview.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(`/mock-interview/${interviewId}/report`, {
                  replace: true,
                })
              }
              className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-white/90"
            >
              View Report
            </button>
          </div>
        </div>
      )}
      {showInsufficientBalanceModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#191B1E] p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-400">
              <FiAlertCircle size={22} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              Insufficient Balance
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#A1A1AA]">
              You need 100 coins to complete this interview.
            </p>

            <button
              type="button"
              onClick={() => setShowInsufficientBalanceModal(false)}
              className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-white/90"
            >
              Okay
            </button>
          </div>
        </div>
      )}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#191B1E] p-6 shadow-2xl">
            {/* Icon */}
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#A1A1AA]">
              <FiCheckCircle size={18} />
            </div>

            {/* Heading */}
            <h2 className="mt-5 text-lg font-semibold text-white">
              Submit interview?
            </h2>

            {/* Description */}
            <p className="mt-2 text-sm leading-6 text-[#71717A]">
              You're about to finish this interview. Any answered questions that
              haven't been evaluated yet will be processed before the interview
              is finalized. If you haven't answered any question, this interview
              will be marked as abandoned.
            </p>

            {/* Divider */}
            <div className="my-5 h-px bg-white/[0.06]" />

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={finalSubmitting}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-medium text-white transition hover:bg-white/[0.08] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSubmitInterview}
                disabled={finalSubmitting}
                className="flex-1 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-white/90 disabled:opacity-50"
              >
                {finalSubmitting ? "Submitting..." : "Submit Interview"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =====================================================
          QUIT CONFIRMATION
      ====================================================== */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#191B1E] p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#A1A1AA]">
              <FiAlertCircle size={18} />
            </div>

            <h2 className="mt-5 text-lg font-semibold">Quit this interview?</h2>

            <p className="mt-2 text-sm leading-6 text-[#71717A]">
              Leaving this interview will permanently abandon this attempt. You
              will not be able to resume it later.
            </p>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setShowQuitModal(false)}
                disabled={quitting}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-medium text-white hover:bg-white/[0.08] disabled:opacity-50"
              >
                Stay
              </button>

              <button
                type="button"
                onClick={handleQuit}
                disabled={quitting}
                className="flex-1 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] disabled:opacity-50"
              >
                {quitting ? "Quitting..." : "Quit Interview"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interview;
