import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
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
  beginInterview,
  getInterview,
  getActiveInterview,
  getNextQuestion,
  getPreviousQuestion,
  quitInterview,
  submitInterview,
  jumpToQuestion,
  saveDraftAnswer,
} from "../api/interview.api";

const MONACO_LANGUAGE_MAP = {
  cpp: "cpp",
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  java: "java",
};

const Interview = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [answer, setAnswer] = useState("");
  const [editorValue, setEditorValue] = useState("");
  const [draftAnswers, setDraftAnswers] = useState({});
  const [questionPanelWidth, setQuestionPanelWidth] = useState(50);
  const draftAnswersRef = useRef({});
  const draftSaveTimeoutRef = useRef(null);
  const draftSaveRequestRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [questionNavigating, setQuestionNavigating] = useState(false);
  const [finalSubmitting, setFinalSubmitting] = useState(false);
  const [quitting, setQuitting] = useState(false);
  const [autoSubmitFailed, setAutoSubmitFailed] = useState(false);

  const [error, setError] = useState("");
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] =
    useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [processingStage, setProcessingStage] = useState("evaluating");
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showInterviewEndedModal, setShowInterviewEndedModal] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const autoSubmitTriggeredRef = useRef(false);
  const isMountedRef = useRef(false);
  const loadRequestIdRef = useRef(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  /*
   * ---------------------------------------------------------
   * Load interview
   * ---------------------------------------------------------
   */

  const loadInterview = useCallback(async () => {
    const requestId = ++loadRequestIdRef.current;

    try {
      setError("");

      const result = await getInterview(interviewId);

      if (!result?.success || !result?.data) {
        throw new Error(result?.message || "Unable to load this interview.");
      }

      const data = result.data;

      if (!isMountedRef.current || requestId !== loadRequestIdRef.current) {
        return;
      }

      autoSubmitTriggeredRef.current = false;

      /*
       * Completed interviews go directly to report/history.
       */
      if (data.status === "completed") {
        navigate(`/mock-interview/history?interview=${interviewId}`, {
          replace: true,
        });

        return;
      }

      if (data.status === "abandoned") {
        navigate("/mock-interview", {
          replace: true,
        });

        return;
      }

      setInterview(data);

      /*
       * Rules are shown only for a newly created interview.
       *
       * created      -> Rules Modal
       * in-progress  -> Resume directly
       */
      setShowRulesModal(data.status === "created");

      const loadedQuestion = Array.isArray(data.questions)
        ? data.questions[data.currentQuestionIndex]
        : null;

      const savedAnswer =
        draftAnswersRef.current[loadedQuestion?.questionId] ??
        loadedQuestion?.answer ??
        "";

      setAnswer(savedAnswer);

      setEditorValue(
        data.interviewType === "coding"
          ? savedAnswer || loadedQuestion?.starterCode || ""
          : savedAnswer,
      );
    } catch (err) {
      if (!isMountedRef.current || requestId !== loadRequestIdRef.current) {
        return;
      }

      console.error("Failed to load interview:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load this interview.",
      );
    } finally {
      if (isMountedRef.current && requestId === loadRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [interviewId, navigate]);

  /*
   * ---------------------------------------------------------
   * Active interview ownership watcher
   * ---------------------------------------------------------
   *
   * Only one interview can be active for an account.
   *
   * If another tab/device starts a new interview, the backend
   * active-interview endpoint will return the new interview.
   *
   * When that happens, this interview is no longer the active
   * interview and this page must immediately inform the user.
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!interviewId || !interview) {
      return;
    }

    let cancelled = false;

    const checkActiveInterview = async () => {
      try {
        const result = await getActiveInterview();

        if (cancelled) {
          return;
        }

        const activeInterview = result?.data || null;

        /*
         * Another interview is now active for this account.
         *
         * That means this interview was replaced from another
         * tab/device.
         */
        if (
          activeInterview &&
          String(activeInterview._id) !== String(interviewId)
        ) {
          setShowInterviewEndedModal(true);
        }
      } catch (err) {
        /*
         * This watcher is only a synchronization mechanism.
         * A temporary network failure must never destroy the
         * current interview UI.
         */
        console.error("Failed to check active interview:", err);
      }
    };

    /*
     * Check when the page becomes visible again.
     *
     * This handles the common multi-tab case:
     *
     * Tab A -> old interview
     * Tab B -> starts new interview
     * User returns to Tab A
     */
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkActiveInterview();
      }
    };

    const handleWindowFocus = () => {
      checkActiveInterview();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    window.addEventListener("focus", handleWindowFocus);

    /*
     * Also check periodically so another device/browser can be
     * detected without requiring a manual refresh.
     */
    const interval = window.setInterval(checkActiveInterview, 5000);

    return () => {
      cancelled = true;

      document.removeEventListener("visibilitychange", handleVisibilityChange);

      window.removeEventListener("focus", handleWindowFocus);

      window.clearInterval(interval);
    };
  }, [interviewId, interview]);

  /*
   * The timeout keeps the initial mount effect free from
   * synchronous state-update warnings.
   */
  useEffect(() => {
    isMountedRef.current = true;

    const timer = window.setTimeout(() => {
      loadInterview();
    }, 0);

    return () => {
      isMountedRef.current = false;
      loadRequestIdRef.current += 1;

      window.clearTimeout(timer);
    };
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
   * Draft persistence
   * ---------------------------------------------------------
   */

  const persistDraftAnswer = useCallback(
    async (questionId, value) => {
      if (!questionId || !interviewId) {
        return;
      }

      const request = saveDraftAnswer(interviewId, questionId, value);

      draftSaveRequestRef.current = request;

      try {
        await request;
      } catch (err) {
        console.error("Failed to save answer draft:", err);
      } finally {
        if (draftSaveRequestRef.current === request) {
          draftSaveRequestRef.current = null;
        }
      }
    },
    [interviewId],
  );

  const scheduleDraftSave = useCallback(
    (questionId, value) => {
      if (!questionId || !interviewId) {
        return;
      }

      if (draftSaveTimeoutRef.current) {
        window.clearTimeout(draftSaveTimeoutRef.current);
      }

      draftSaveTimeoutRef.current = window.setTimeout(() => {
        persistDraftAnswer(questionId, value);
      }, 700);
    },
    [interviewId, persistDraftAnswer],
  );

  const flushDraftSave = useCallback(
    async (questionId, value) => {
      if (!questionId || !interviewId) {
        return;
      }

      if (draftSaveTimeoutRef.current) {
        window.clearTimeout(draftSaveTimeoutRef.current);
        draftSaveTimeoutRef.current = null;
      }

      await persistDraftAnswer(questionId, value);
    },
    [interviewId, persistDraftAnswer],
  );

  const handleAnswerChange = useCallback(
    (value) => {
      setAnswer(value);
      setEditorValue(value);

      if (currentQuestion?.questionId) {
        const questionId = currentQuestion.questionId;

        draftAnswersRef.current[questionId] = value;

        setDraftAnswers((previous) => ({
          ...previous,
          [questionId]: value,
        }));

        scheduleDraftSave(questionId, value);
      }
    },
    [currentQuestion, scheduleDraftSave],
  );

  const handleQuestionPanelResize = useCallback((event) => {
    const container = event.currentTarget.parentElement;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const percentage = ((event.clientX - rect.left) / rect.width) * 100;

    const clampedWidth = Math.min(70, Math.max(30, percentage));

    setQuestionPanelWidth(clampedWidth);
  }, []);

  useEffect(() => {
    return () => {
      if (draftSaveTimeoutRef.current) {
        window.clearTimeout(draftSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleTerminalInterviewState = useCallback(
    (data) => {
      if (!data) {
        return false;
      }

      if (data.status === "completed") {
        setProcessingStage("report");
        setReportReady(true);
        setShowCompletionModal(true);
        return true;
      }

      if (data.status === "abandoned") {
        setShowCompletionModal(false);
        setReportReady(false);
        navigate("/mock-interview", {
          replace: true,
        });
        return true;
      }

      return false;
    },
    [navigate],
  );

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

    if (handleTerminalInterviewState(result.data)) {
      return result.data;
    }

    setInterview(result.data);

    const refreshedQuestion = Array.isArray(result.data.questions)
      ? result.data.questions[result.data.currentQuestionIndex]
      : null;

    const refreshedSavedAnswer =
      draftAnswersRef.current[refreshedQuestion?.questionId] ??
      refreshedQuestion?.answer ??
      "";

    setAnswer(refreshedSavedAnswer);

    setEditorValue(
      result.data.interviewType === "coding"
        ? refreshedSavedAnswer || refreshedQuestion?.starterCode || ""
        : refreshedSavedAnswer,
    );

    return result.data;
  }, [interviewId, handleTerminalInterviewState]);

  /*
   * ---------------------------------------------------------
   * Next question
   * ---------------------------------------------------------
   */

  const handleNextQuestion = async () => {
    if (
      !interview ||
      interview.status !== "in-progress" ||
      navigating ||
      finalSubmitting ||
      quitting ||
      isLastQuestion
    ) {
      return;
    }

    try {
      setQuestionNavigating(true);
      setError("");

      if (currentQuestion?.questionId) {
        await flushDraftSave(currentQuestion.questionId, answer);
      }

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

      const nextSavedAnswer =
        draftAnswersRef.current[nextQuestion?.questionId] ??
        nextQuestion?.answer ??
        "";

      setAnswer(nextSavedAnswer);

      setEditorValue(
        interview.interviewType === "coding"
          ? nextSavedAnswer || nextQuestion?.starterCode || ""
          : nextSavedAnswer,
      );
    } catch (err) {
      console.error("Failed to move to next question:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to move to the next question.",
      );
    } finally {
      setQuestionNavigating(false);
    }
  };
  /*
   * ---------------------------------------------------------
   * Previous question
   * ---------------------------------------------------------
   */

  const handlePreviousQuestion = async () => {
    if (
      !interview ||
      interview.status !== "in-progress" ||
      navigating ||
      finalSubmitting ||
      quitting ||
      questionNumber <= 1
    ) {
      return;
    }

    try {
      setQuestionNavigating(true);
      setError("");

      if (currentQuestion?.questionId) {
        await flushDraftSave(currentQuestion.questionId, answer);
      }

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

      const previousSavedAnswer =
        draftAnswersRef.current[previousQuestion?.questionId] ??
        previousQuestion?.answer ??
        "";

      setAnswer(previousSavedAnswer);

      setEditorValue(
        updatedInterview.interviewType === "coding"
          ? previousSavedAnswer || previousQuestion?.starterCode || ""
          : previousSavedAnswer,
      );
    } catch (err) {
      console.error("Failed to move to previous question:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to move to the previous question.",
      );
    } finally {
      setQuestionNavigating(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Jump to question
   * ---------------------------------------------------------
   */

  const handleQuestionJump = async (index) => {
    if (
      !interview ||
      interview.status !== "in-progress" ||
      navigating ||
      finalSubmitting ||
      quitting ||
      index === interview.currentQuestionIndex ||
      index < 0 ||
      index >= interview.questions.length
    ) {
      return;
    }
    try {
      setQuestionNavigating(true);
      setError("");

      if (currentQuestion?.questionId) {
        await flushDraftSave(currentQuestion.questionId, answer);
      }

      const result = await jumpToQuestion(interviewId, index);

      if (!result?.success || !result?.data) {
        throw new Error(
          result?.message || "Unable to move to the selected question.",
        );
      }

      const updatedInterview = result.data;
      const jumpedQuestion =
        updatedInterview.questions?.[updatedInterview.currentQuestionIndex];

      setInterview(updatedInterview);

      const jumpedSavedAnswer =
        draftAnswersRef.current[jumpedQuestion?.questionId] ??
        jumpedQuestion?.answer ??
        "";

      setAnswer(jumpedSavedAnswer);

      setEditorValue(
        updatedInterview.interviewType === "coding"
          ? jumpedSavedAnswer || jumpedQuestion?.starterCode || ""
          : jumpedSavedAnswer,
      );
    } catch (err) {
      console.error("Failed to jump to question:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to move to the selected question.",
      );
    } finally {
      setQuestionNavigating(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Final submit
   * ---------------------------------------------------------
   */
  const handleSubmitInterview = useCallback(
    async ({ automatic = false, timerExpired = false } = {}) => {
      if (
        !interview ||
        finalSubmitting ||
        navigating ||
        quitting ||
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
        setAutoSubmitFailed(false);
        setError("");
        setShowInsufficientBalanceModal(false);
        setReportReady(false);
        setProcessingStage("evaluating");
        setShowCompletionModal(true);

        if (currentQuestion?.questionId) {
          await flushDraftSave(currentQuestion.questionId, answer);
        }

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
          setProcessingStage("report");
          setReportReady(true);

          return;
        }
        if (
          result?.data?.status === "abandoned" ||
          result?.data?.interview?.status === "abandoned"
        ) {
          /*
           * Empty submission is a silent discard.
           * No report, no balance deduction, and no intermediate screen.
           */
          setShowCompletionModal(false);
          setReportReady(false);
          navigate("/mock-interview", {
            replace: true,
          });

          return;
        }

        /*
         * Defensive fallback:
         * refresh the interview in case the API response does
         * not directly contain the completed interview.
         */
        const refreshed = await refreshInterview();

        if (refreshed?.status === "completed") {
          setProcessingStage("report");
          setReportReady(true);
          return;
        }

        if (refreshed?.status === "abandoned") {
          setShowCompletionModal(false);
          setReportReady(false);

          navigate("/mock-interview", {
            replace: true,
          });

          return;
        }
      } catch (err) {
        const statusCode = err?.response?.status;
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to submit the interview. Please try again.";

        /*
         * Automatic submission can race with the backend's
         * server-side expiry/finalization.
         *
         * If another request is already finalizing the interview,
         * this request receives 409. That is NOT a submission failure.
         * Wait for the existing finalization to finish.
         */
        const alreadyFinalizing =
          automatic &&
          statusCode === 409 &&
          errorMessage.toLowerCase().includes("already being finalized");

        if (alreadyFinalizing) {
          setError("");
          setAutoSubmitFailed(false);
          setShowCompletionModal(true);
          setProcessingStage("evaluating");
          setReportReady(false);

          let attempts = 0;
          const maxAttempts = 60;

          while (attempts < maxAttempts) {
            attempts += 1;

            await new Promise((resolve) => {
              window.setTimeout(resolve, 2000);
            });

            try {
              const latest = await getInterview(interviewId);

              if (!latest?.success || !latest?.data) {
                continue;
              }

              const latestInterview = latest.data;

              if (latestInterview.status === "completed") {
                setInterview(latestInterview);
                setProcessingStage("report");
                setReportReady(true);
                setShowCompletionModal(true);
                return;
              }

              if (latestInterview.status === "abandoned") {
                setShowCompletionModal(false);
                setReportReady(false);

                navigate("/mock-interview", {
                  replace: true,
                });

                return;
              }
            } catch (pollError) {
              console.error(
                "Failed while waiting for interview finalization:",
                pollError,
              );
            }
          }

          /*
           * The backend did not finish finalization within the
           * expected window.
           */
          setShowCompletionModal(false);
          setReportReady(false);
          setAutoSubmitFailed(true);
          setError(
            "Your interview is still being finalized. Please retry in a moment.",
          );

          return;
        }

        /*
         * Normal submission failure.
         */
        console.error(
          automatic
            ? "Automatic interview submission failed:"
            : "Failed to submit interview:",
          err,
        );

        setShowCompletionModal(false);
        setReportReady(false);

        if (timerExpired) {
          setAutoSubmitFailed(true);
        }

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
      isCompleted,
      interviewId,
      refreshInterview,
      answer,
      currentQuestion,
      flushDraftSave,
      navigate,
    ],
  );

  const handleConfirmSubmitInterview = useCallback(async () => {
    setShowSubmitModal(false);

    await handleSubmitInterview({
      automatic: true,
    });
  }, [handleSubmitInterview]);

  const handleRetryAutoSubmit = useCallback(async () => {
    setAutoSubmitFailed(false);

    await handleSubmitInterview({
      automatic: true,
      timerExpired: true,
    });
  }, [handleSubmitInterview]);

  useEffect(() => {
    if (
      !interview ||
      interview.status !== "in-progress" ||
      !interview.startedAt ||
      isCompleted
    ) {
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
        !isCompleted
      ) {
        autoSubmitTriggeredRef.current = true;

        handleSubmitInterview({
          automatic: true,
          timerExpired: true,
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
    isCompleted,
    finalSubmitting,
    interview,
    handleSubmitInterview,
  ]);

  /*
   * ---------------------------------------------------------
   * Quit
   * ---------------------------------------------------------
   */

  const handleQuit = async () => {
    if (finalSubmitting || isCompleted) {
      return;
    }

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
    if (!interview || isCompleted) {
      return;
    }

    const handlePopState = () => {
      window.history.pushState(
        { interviewGuard: true },
        "",
        window.location.href,
      );

      if (finalSubmitting || isCompleted) {
        return;
      }

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
  }, [interview, isCompleted, finalSubmitting]);

  /*
   * ---------------------------------------------------------
   * Loading
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111214] text-white">
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111214] text-white">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
        :focus-visible {
          outline: 2px solid rgba(255,255,255,0.72);
          outline-offset: 3px;
        }
`}</style>
      {/* =====================================================
          FIXED TOP BAR
      ====================================================== */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#111214]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left — Interview identity */}
          <div className="flex min-w-0 items-center gap-3">
            {/* RIO mark */}
            <div className="hidden h-9 w-9 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.045] shadow-[0_16px_45px_rgba(0,0,0,0.16)] sm:flex">
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
                  ? "border-white/[0.16] bg-white/[0.045] text-[#E4E4E7]"
                  : "border-white/[0.10] bg-white/[0.045] text-[#D4D4D8]"
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
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-white/[0.10] bg-white/[0.035] px-4 py-3 text-sm text-[#D4D4D8] shadow-[0_14px_40px_rgba(0,0,0,0.14)]">
                <FiAlertCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-[#A1A1AA]"
                />
                <div>
                  <p>{error}</p>

                  {autoSubmitFailed && (
                    <button
                      type="button"
                      onClick={handleRetryAutoSubmit}
                      disabled={finalSubmitting}
                    >
                      {finalSubmitting ? "Retrying..." : "Retry Submission"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ===================================================
            QUESTION
        ==================================================== */}
            <div
              className={
                currentQuestion?.section === "coding"
                  ? "mt-6 grid min-h-0 w-full lg:h-[calc(100vh-104px)]"
                  : ""
              }
              style={
                currentQuestion?.section === "coding"
                  ? {
                      gridTemplateColumns: `minmax(0, ${questionPanelWidth}fr) 8px minmax(0, ${
                        100 - questionPanelWidth
                      }fr)`,
                    }
                  : undefined
              }
            >
              <section className="relative min-h-0 overflow-hidden rounded-[26px] border border-white/[0.09] bg-white/[0.038] shadow-[0_24px_80px_rgba(0,0,0,0.14)]">
                {/* Question ambient glow */}
                <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-white/[0.06] blur-[100px]" />

                <div className="relative h-full overflow-y-auto px-6 py-6 sm:px-8 sm:py-8 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
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
                  {currentQuestion?.section === "coding" ? (
                    <div className="mt-4">
                      <h1 className="text-lg font-semibold leading-7 text-[#F4F4F5] sm:text-xl">
                        {currentQuestion?.title || "Coding Problem"}
                      </h1>

                      <div className="mt-4 whitespace-pre-wrap text-[13px] leading-7 text-[#D4D4D8] sm:text-[14px]">
                        {currentQuestion?.text || "Question unavailable."}
                      </div>

                      {Array.isArray(currentQuestion?.constraints) &&
                        currentQuestion.constraints.length > 0 && (
                          <div className="mt-6">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                              Constraints
                            </p>

                            <ul className="mt-3 space-y-2">
                              {currentQuestion.constraints.map(
                                (constraint, index) => (
                                  <li
                                    key={index}
                                    className="text-[12px] leading-6 text-[#A1A1AA] sm:text-[13px]"
                                  >
                                    • {constraint}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}

                      {Array.isArray(currentQuestion?.examples) &&
                        currentQuestion.examples.length > 0 && (
                          <div className="mt-6">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                              Examples
                            </p>

                            <div className="mt-3 space-y-3">
                              {currentQuestion.examples.map(
                                (example, index) => (
                                  <div
                                    key={index}
                                    className="rounded-xl border border-white/[0.06] bg-black/20 p-4"
                                  >
                                    <p className="font-mono text-[12px] leading-6 text-[#D4D4D8]">
                                      Input: {example.input}
                                    </p>

                                    <p className="mt-1 font-mono text-[12px] leading-6 text-[#D4D4D8]">
                                      Output: {example.output}
                                    </p>

                                    {example.explanation && (
                                      <p className="mt-2 text-[11px] leading-5 text-[#71717A]">
                                        {example.explanation}
                                      </p>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <h1 className="mt-4 w-full font-sans text-[11px] font-medium leading-[1.45] tracking-[-0.005em] text-[#F4F4F5] sm:text-[14px] lg:text-[16px]">
                      {currentQuestion?.text || "Question unavailable."}
                    </h1>
                  )}
                </div>
              </section>

              {currentQuestion?.section === "coding" && (
                <div
                  role="separator"
                  aria-label="Resize question and editor panels"
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    event.currentTarget.onpointermove =
                      handleQuestionPanelResize;
                  }}
                  onPointerUp={(event) => {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                    event.currentTarget.onpointermove = null;
                  }}
                  onPointerCancel={(event) => {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                    event.currentTarget.onpointermove = null;
                  }}
                  className="hidden cursor-col-resize items-center justify-center rounded-full bg-white/[0.08] transition hover:bg-white/[0.18] lg:flex"
                >
                  <div className="h-12 w-0.5 rounded-full bg-white/20" />
                </div>
              )}

              {/* ===================================================
    PREMIUM ANSWER WORKSPACE
==================================================== */}

              <section className="relative flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0D0F12]/88 shadow-[0_30px_100px_rgba(0,0,0,0.18)]">
                {/* Editor glow */}
                <div className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-white/[0.025] blur-[100px]" />

                {/* Editor header */}
                <div className="relative flex items-start justify-between gap-4 border-b border-white/[0.06] px-6 py-5 sm:px-7">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA]">
                        Your response
                      </p>

                      {currentQuestion?.section === "coding" &&
                        interview?.codingLanguage && (
                          <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[#71717A]">
                            {interview.codingLanguage}
                          </span>
                        )}
                    </div>

                    <p className="mt-2 max-w-xl text-[11px] leading-5 text-[#52525B]">
                      {currentQuestion?.section === "coding"
                        ? "Write your solution below. Your code will be evaluated by AI after final submission."
                        : "Think out loud. Explain the reasoning, assumptions, trade-offs, and approach you would give to a real interviewer."}
                    </p>
                  </div>

                  {answer.trim().length > 0 && (
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#71717A]">
                      Draft saved
                    </span>
                  )}
                </div>

                {/* Writing area */}
                <div className="relative flex min-h-0 flex-1 flex-col">
                  {currentQuestion?.section === "coding" ? (
                    <Editor
                      height={
                        currentQuestion?.section === "coding" ? "100%" : "420px"
                      }
                      language={
                        MONACO_LANGUAGE_MAP[interview?.codingLanguage] ||
                        "plaintext"
                      }
                      theme="vs-dark"
                      value={editorValue}
                      onChange={(value) => handleAnswerChange(value ?? "")}
                      options={{
                        minimap: {
                          enabled: false,
                        },
                        fontSize: 14,
                        lineNumbers: "on",
                        automaticLayout: true,
                        wordWrap: "off",
                        scrollBeyondLastLine: false,
                        scrollbar: {
                          vertical: "visible",
                          horizontal: "visible",
                          verticalScrollbarSize: 6,
                          horizontalScrollbarSize: 6,
                          useShadows: false,
                        },
                        padding: {
                          top: 16,
                          bottom: 16,
                        },
                        readOnly:
                          questionNavigating || quitting || finalSubmitting,
                      }}
                    />
                  ) : (
                    <textarea
                      value={answer}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      disabled={
                        questionNavigating || quitting || finalSubmitting
                      }
                      placeholder="Start explaining your approach..."
                      className="min-h-[300px] w-full resize-none border-0 bg-transparent px-6 py-6 font-sans text-[14px] leading-7 tracking-[0.005em] text-[#E4E4E7] outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden placeholder:text-[#3F3F46] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[360px] sm:px-7 sm:py-7"
                    />
                  )}

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
                      disabled={
                        questionNavigating || finalSubmitting || quitting
                      }
                      className={[
                        "flex h-10 items-center justify-center rounded-xl border font-sans text-[12px] font-semibold transition-all",
                        isActive
                          ? "border-white bg-white text-[#17191C]"
                          : isAnswered
                            ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                            : "border-white/[0.08] bg-white/[0.035] text-[#71717A] hover:bg-white/[0.07] hover:text-[#D4D4D8]",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2">
                        <span>{number}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Navigation */}
              <div className=" pt-4">
                {/* Draft status */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center">
                  <p className="text-[10px] font-semibold leading-5 text-[#818187]">
                    Your answer is saved as a draft until you submit the
                    interview.
                  </p>
                </div>

                <div className="mt-3 h-px bg-white/[0.06]" />

                {/* Previous / Next */}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handlePreviousQuestion}
                    disabled={
                      navigating ||
                      finalSubmitting ||
                      quitting ||
                      questionNumber === 1
                    }
                    className="flex h-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] font-sans text-[12px] font-semibold text-white/65 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ← Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={
                      navigating ||
                      finalSubmitting ||
                      quitting ||
                      isLastQuestion
                    }
                    className="flex h-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] font-sans text-[12px] font-semibold text-white/65 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  disabled={
                    !canSubmitFinal ||
                    !isLastQuestion ||
                    finalSubmitting ||
                    navigating ||
                    quitting
                  }
                  className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    isLastQuestion
                      ? "bg-white text-black hover:bg-[#E4E4E7]"
                      : "cursor-not-allowed bg-white/[0.08] text-[#71717A]"
                  } disabled:opacity-30`}
                >
                  <FiCheck size={14} />
                  Submit Interview
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
      {/* =====================================================
          FIXED BOTTOM BAR
      ====================================================== */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#111315]/92 px-4 py-3 shadow-[0_-18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-6 lg:hidden">
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
      {showInterviewEndedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#191B1E] p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.045] text-[#D4D4D8]">
              <FiAlertCircle size={22} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              Interview ended
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#A1A1AA]">
              This interview has been terminated because a new interview was
              started from your account.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowInterviewEndedModal(false);

                navigate("/mock-interview", {
                  replace: true,
                });
              }}
              className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-white/90"
            >
              OK
            </button>
          </div>
        </div>
      )}
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
                • If you haven't answered anything, no report will be generated
                and no balance will be deducted.
              </p>

              <p className="text-xs leading-5 text-[#A1A1AA]">
                • If you quit the interview, your attempt will be discarded. No
                report will be generated and no balance will be deducted.
              </p>
            </div>

            <button
              type="button"
              disabled={navigating || interview.status !== "created"}
              onClick={async () => {
                if (navigating || interview.status !== "created") {
                  return;
                }

                try {
                  setNavigating(true);
                  setError("");

                  const result = await beginInterview(interviewId);

                  if (!result?.success || !result?.data) {
                    throw new Error("Failed to start interview.");
                  }

                  setInterview(result.data);
                  setShowRulesModal(false);
                } catch (err) {
                  setError(
                    err?.response?.data?.message ||
                      err?.message ||
                      "Failed to start interview.",
                  );
                } finally {
                  setNavigating(false);
                }
              }}
              className="w-full rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {navigating ? "Starting Interview..." : "I Understand & Continue"}
            </button>
          </div>
        </div>
      )}
      {showCompletionModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#191B1E] p-6 text-center shadow-2xl">
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full border ${
                reportReady
                  ? "border-white/[0.10] bg-white/[0.045] text-[#D4D4D8]"
                  : "border-white/10 bg-white/[0.05] text-[#A1A1AA]"
              }`}
            >
              {reportReady ? (
                <FiCheckCircle size={22} />
              ) : (
                <FiLoader size={22} className="animate-spin" />
              )}
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              {reportReady
                ? "Interview Completed"
                : processingStage === "evaluating"
                  ? "We are evaluating your answers..."
                  : "Generating your interview report..."}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#A1A1AA]">
              {reportReady
                ? "Your interview has been evaluated and your report is ready."
                : processingStage === "evaluating"
                  ? "Your answers are being evaluated. Please wait..."
                  : "Your detailed interview report is being generated. Please wait..."}
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
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold transition ${
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
                  <FiLoader size={14} className="animate-spin" />
                  Processing...
                </>
              )}
            </button>
          </div>
        </div>
      )}
      {showInsufficientBalanceModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#191B1E] p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.045] text-[#D4D4D8]">
              <FiAlertCircle size={22} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              Insufficient Balance
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#A1A1AA]">
              You need ₹100 in your balance to complete this interview.
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
              is finalized. If you haven't answered anything, no report will be
              generated and no balance will be deducted.
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
              If you quit now, this interview will be discarded. No report will
              be generated and no balance will be deducted.
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
                disabled={quitting || finalSubmitting}
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
