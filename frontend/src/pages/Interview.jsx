import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiPause,
  FiPlay,
  FiSend,
  FiX,
} from "react-icons/fi";

import {
  getInterview,
  getNextQuestion,
  getPreviousQuestion,
  pauseInterview,
  quitInterview,
  resumeInterview,
  submitAnswer,
  submitInterview,
} from "../api/interview.api";

const Interview = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finalSubmitting, setFinalSubmitting] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [quitting, setQuitting] = useState(false);

  const [error, setError] = useState("");
  const [showQuitModal, setShowQuitModal] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState(null);

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

      if (data.status === "completed") {
        navigate(`/mock-interview/${interviewId}/report`, {
          replace: true,
        });

        return;
      }

      setInterview(data);

      if (data.status === "abandoned") {
        setError("This interview has already been abandoned.");
      }
    } catch (err) {
      console.error("Failed to load interview:", err);
``
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load this interview.",
      );
    } finally {
      setLoading(false);
    }
  }, [interviewId, navigate]);

  useEffect(() => {
    loadInterview();
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
   * Question progress
   * ---------------------------------------------------------
   */

  const questionNumber = interview
    ? (interview.currentQuestionIndex || 0) + 1
    : 0;

  const totalQuestions = interview?.questions?.length || 0;

  const submittedQuestions =
    interview?.questions?.filter(
      (question) => question.answerStatus === "submitted",
    ).length || 0;

  const unansweredQuestions = Math.max(totalQuestions - submittedQuestions, 0);

  const progress =
    totalQuestions > 0
      ? Math.min((questionNumber / totalQuestions) * 100, 100)
      : 0;

  const isCurrentQuestionSubmitted =
    currentQuestion?.answerStatus === "submitted";

  /*
   * ---------------------------------------------------------
   * Sync answer with current question
   * ---------------------------------------------------------
   *
   * Each question owns its own persisted answer.
   *
   * When navigation happens:
   *
   * Q1 -> Q2
   * Q2 -> Q3
   * Q3 -> Q1
   *
   * the textarea always reflects that question's answer.
   */

  /*
   * ---------------------------------------------------------
   * Timer
   * ---------------------------------------------------------
   *
   * The backend remains the source of truth.
   *
   * This countdown is only a UI representation.
   * Backend validates expiry independently.
   */

  useEffect(() => {
    if (!interview) return;

    if (interview.status !== "in-progress") {
      return;
    }

    const startedAt = new Date(interview.startedAt).getTime();

    if (Number.isNaN(startedAt)) {
      return;
    }

    const totalSeconds = Number(interview.timeLimit || 30) * 60;

    const updateTimer = () => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);

      const remaining = Math.max(totalSeconds - elapsedSeconds, 0);

      setRemainingSeconds(remaining);
    };

    const timer = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(timer);
  }, [interview]);

  /*
   * ---------------------------------------------------------
   * Timer formatting
   * ---------------------------------------------------------
   */

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";

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
   * Navigate to question
   * ---------------------------------------------------------
   */

  const refreshInterview = async () => {
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

    return result.data;
  };

  /*
   * ---------------------------------------------------------
   * Next question
   * ---------------------------------------------------------
   */

  const handleNextQuestion = async () => {
    if (!interview || navigating || isPaused || isAbandoned) {
      return;
    }

    if (questionNumber >= totalQuestions) {
      return;
    }

    try {
      setNavigating(true);
      setError("");

      const result = await getNextQuestion(interviewId);

      if (!result?.success) {
        throw new Error(
          result?.message || "Unable to move to the next question.",
        );
      }

      if (result.data) {
        setInterview(result.data);
      } else {
        await refreshInterview();
      }
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
    if (!interview || navigating || isPaused || isAbandoned) {
      return;
    }

    if (questionNumber <= 1) {
      return;
    }

    try {
      setNavigating(true);
      setError("");

      const result = await getPreviousQuestion(interviewId);

      if (!result?.success) {
        throw new Error(
          result?.message || "Unable to move to the previous question.",
        );
      }

      if (result.data) {
        setInterview(result.data);
      } else {
        await refreshInterview();
      }
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
   * Jump to a specific question
   * ---------------------------------------------------------
   */

  const handleQuestionJump = async (index) => {
    if (
      !interview ||
      navigating ||
      isPaused ||
      isAbandoned ||
      index === interview.currentQuestionIndex
    ) {
      return;
    }

    try {
      setNavigating(true);
      setError("");

      /*
       * Backend currently exposes only next/previous navigation.
       *
       * Therefore move step-by-step until the requested index.
       */

      let currentIndex = interview.currentQuestionIndex;

      while (currentIndex !== index) {
        const movingForward = currentIndex < index;

        const result = movingForward
          ? await getNextQuestion(interviewId)
          : await getPreviousQuestion(interviewId);

        if (!result?.success || !result?.data) {
          throw new Error("Unable to navigate to that question.");
        }

        const updatedInterview = result.data;

        setInterview(updatedInterview);

        currentIndex = updatedInterview.currentQuestionIndex;
      }
    } catch (err) {
      console.error("Failed to navigate to question:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to navigate to that question.",
      );
    } finally {
      setNavigating(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Submit current answer
   * ---------------------------------------------------------
   *
   * This ONLY submits the current question.
   *
   * It does NOT navigate automatically.
   */

  const handleSubmitAnswer = async () => {
    if (
      !interview ||
      !currentQuestion ||
      submitting ||
      isPaused ||
      isAbandoned
    ) {
      return;
    }

    if (isCurrentQuestionSubmitted) {
      return;
    }

    if (!answer.trim()) {
      setError("Please write an answer before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const result = await submitAnswer(
        interviewId,
        currentQuestion.questionId,
        answer.trim(),
      );

      if (!result?.success) {
        throw new Error(result?.message || "Unable to submit your answer.");
      }

      /*
       * Backend returns the updated interview/question state.
       * Refreshing guarantees that the frontend uses persisted data.
       */

      if (result?.data) {
        setInterview(result.data);
      } else {
        await refreshInterview();
      }
    } catch (err) {
      console.error("Failed to submit answer:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to submit your answer. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Final Submit Interview
   * ---------------------------------------------------------
   */

  const handleSubmitInterview = async () => {
    if (
      !interview ||
      finalSubmitting ||
      submitting ||
      navigating ||
      pausing ||
      quitting ||
      isPaused ||
      isAbandoned
    ) {
      return;
    }

    try {
      setFinalSubmitting(true);
      setError("");

      const result = await submitInterview(interviewId);

      if (!result?.success) {
        throw new Error(result?.message || "Unable to submit the interview.");
      }

      /*
       * Successful final submission means the report is ready.
       */

      if (
        result?.data?.status === "completed" ||
        result?.data?.interview?.status === "completed"
      ) {
        navigate(`/mock-interview/${interviewId}/report`, {
          replace: true,
        });

        return;
      }

      /*
       * Fallback:
       * refresh persisted backend state.
       */

      const refreshed = await refreshInterview();

      if (refreshed?.status === "completed") {
        navigate(`/mock-interview/${interviewId}/report`, {
          replace: true,
        });
      }
    } catch (err) {
      console.error("Failed to submit interview:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to submit the interview. Please try again.",
      );
    } finally {
      setFinalSubmitting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Pause interview
   * ---------------------------------------------------------
   */

  const handlePause = async () => {
    if (!interview) return;

    try {
      setPausing(true);
      setError("");

      const result = await pauseInterview(interviewId);

      if (!result?.success || !result?.data) {
        throw new Error(result?.message || "Unable to pause the interview.");
      }

      setInterview(result.data);
    } catch (err) {
      console.error("Failed to pause interview:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to pause the interview.",
      );
    } finally {
      setPausing(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Resume interview
   * ---------------------------------------------------------
   */

  const handleResume = async () => {
    if (!interview) return;

    try {
      setPausing(true);
      setError("");

      const result = await resumeInterview(interviewId);

      if (!result?.success || !result?.data) {
        throw new Error(result?.message || "Unable to resume the interview.");
      }

      setInterview(result.data);
    } catch (err) {
      console.error("Failed to resume interview:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to resume the interview.",
      );
    } finally {
      setPausing(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Quit interview
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
   * Loading screen
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
            onClick={loadInterview}
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
   * Interview state
   * ---------------------------------------------------------
   */

  const isPaused = interview.status === "paused";
  const isAbandoned = interview.status === "abandoned";

  const isLastQuestion = questionNumber === totalQuestions;

  const canSubmitFinal =
    totalQuestions > 0 && interview.status === "in-progress";

  return (
    <div className="min-h-screen bg-[#111315] text-white">
      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className="border-b border-white/[0.08] bg-[#111315]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] sm:flex">
              <FiPlay size={15} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {interview.role || "Mock Interview"}
              </p>

              <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#71717A]">
                {interview.interviewType || "Interview"}
              </p>
            </div>
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
              remainingSeconds !== null && remainingSeconds <= 60
                ? "border-red-400/25 bg-red-400/[0.06] text-red-300"
                : "border-white/10 bg-white/[0.04] text-[#D4D4D8]"
            }`}
          >
            <FiClock size={14} />

            <span className="font-mono text-sm font-medium">
              {formatTime(remainingSeconds)}
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================
          PROGRESS
      ====================================================== */}

      <div className="border-b border-white/[0.06] bg-[#111315]">
        <div className="mx-auto max-w-[1400px] px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-[#71717A]">
            <span>
              Question {questionNumber} of {totalQuestions}
            </span>

            <span>
              {submittedQuestions}/{totalQuestions} submitted
            </span>
          </div>

          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <main className="mx-auto flex min-h-[calc(100vh-105px)] max-w-[1100px] flex-col px-4 pb-8 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        {/* ===================================================
            QUESTION NAVIGATOR
        ==================================================== */}

        <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#A1A1AA]">Questions</p>

            <p className="text-[10px] text-[#52525B]">
              {unansweredQuestions} remaining
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {interview.questions.map((question, index) => {
              const isActive = index === interview.currentQuestionIndex;

              const isSubmitted = question.answerStatus === "submitted";

              return (
                <button
                  key={question.questionId}
                  type="button"
                  onClick={() => handleQuestionJump(index)}
                  disabled={navigating || isPaused || isAbandoned}
                  className={`flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    isActive
                      ? "border-white bg-white text-[#17191C]"
                      : isSubmitted
                        ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300 hover:bg-emerald-400/[0.13]"
                        : "border-white/10 bg-white/[0.03] text-[#A1A1AA] hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {isSubmitted && <FiCheck size={12} />}

                  {index + 1}
                </button>
              );
            })}
          </div>
        </section>

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

        <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-7 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {currentQuestion?.section && (
              <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">
                {currentQuestion.section}
              </span>
            )}

            {currentQuestion?.type && (
              <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10px] font-medium capitalize text-[#A1A1AA]">
                {currentQuestion.type}
              </span>
            )}

            {currentQuestion?.difficulty && (
              <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10px] font-medium capitalize text-[#A1A1AA]">
                {currentQuestion.difficulty}
              </span>
            )}

            {isCurrentQuestionSubmitted && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-emerald-300">
                <FiCheck size={11} />
                Submitted
              </span>
            )}
          </div>

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
            Interviewer
          </p>

          <h1 className="mt-4 text-xl font-medium leading-8 tracking-[-0.015em] text-white sm:text-2xl sm:leading-9">
            {currentQuestion?.text || "Question unavailable."}
          </h1>
        </section>

        {/* ===================================================
            ANSWER
        ==================================================== */}

        <section className="mt-4 flex flex-1 flex-col rounded-2xl border border-white/10 bg-white/[0.045]">
          <div className="border-b border-white/[0.07] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-[#A1A1AA]">Your answer</p>

              {isCurrentQuestionSubmitted && (
                <span className="text-[10px] text-emerald-300">
                  Answer locked
                </span>
              )}
            </div>

            <p className="mt-1 text-[10px] text-[#52525B]">
              {isCurrentQuestionSubmitted
                ? "This answer has already been submitted and cannot be edited."
                : "Explain your reasoning clearly. The interviewer will evaluate correctness, clarity and communication."}
            </p>
          </div>

          <textarea
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);

              if (error) {
                setError("");
              }
            }}
            disabled={
              submitting ||
              navigating ||
              pausing ||
              quitting ||
              finalSubmitting ||
              isPaused ||
              isAbandoned ||
              isCurrentQuestionSubmitted
            }
            placeholder={
              isPaused
                ? "Interview is paused."
                : isCurrentQuestionSubmitted
                  ? "This answer has been submitted."
                  : "Type your answer here..."
            }
            className="min-h-[260px] flex-1 resize-none bg-transparent px-5 py-5 text-sm leading-7 text-white outline-none placeholder:text-[#52525B] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[320px] sm:px-6"
          />

          <div className="border-t border-white/[0.07] px-5 py-3 text-[10px] text-[#52525B] sm:px-6">
            {answer.trim().length} characters
          </div>
        </section>

        {/* ===================================================
            NAVIGATION + SUBMIT
        ==================================================== */}

        <div className="mt-4 flex flex-col gap-3">
          {/* Question navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePreviousQuestion}
              disabled={
                navigating ||
                submitting ||
                finalSubmitting ||
                pausing ||
                quitting ||
                isPaused ||
                isAbandoned ||
                questionNumber <= 1
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-medium text-[#D4D4D8] transition-colors hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft size={14} />
              Previous
            </button>

            <span className="text-[10px] uppercase tracking-[0.12em] text-[#52525B]">
              {questionNumber} / {totalQuestions}
            </span>

            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={
                navigating ||
                submitting ||
                finalSubmitting ||
                pausing ||
                quitting ||
                isPaused ||
                isAbandoned ||
                isLastQuestion
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-medium text-[#D4D4D8] transition-colors hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <FiChevronRight size={14} />
            </button>
          </div>

          {/* Main controls */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              {isPaused ? (
                <button
                  type="button"
                  onClick={handleResume}
                  disabled={pausing || quitting}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-medium text-white transition-colors hover:bg-white/[0.09] disabled:opacity-50"
                >
                  <FiPlay size={14} />

                  {pausing ? "Resuming..." : "Resume"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  disabled={
                    pausing ||
                    submitting ||
                    finalSubmitting ||
                    navigating ||
                    quitting ||
                    isAbandoned
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-medium text-[#D4D4D8] transition-colors hover:bg-white/[0.09] disabled:opacity-50"
                >
                  <FiPause size={14} />

                  {pausing ? "Pausing..." : "Pause"}
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowQuitModal(true)}
                disabled={
                  quitting || submitting || finalSubmitting || navigating
                }
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-medium text-[#A1A1AA] transition-colors hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
              >
                <FiX size={14} />
                Quit
              </button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Individual answer submit */}
              {!isCurrentQuestionSubmitted && (
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={
                    submitting ||
                    navigating ||
                    pausing ||
                    quitting ||
                    finalSubmitting ||
                    isPaused ||
                    isAbandoned ||
                    !answer.trim()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-[#17191C] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#52525E] border-t-[#17191C]" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <FiSend size={14} />
                      Submit Answer
                    </>
                  )}
                </button>
              )}

              {/* Final interview submit */}
              <button
                type="button"
                onClick={handleSubmitInterview}
                disabled={
                  !canSubmitFinal ||
                  finalSubmitting ||
                  submitting ||
                  navigating ||
                  pausing ||
                  quitting ||
                  isPaused ||
                  isAbandoned
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/[0.13] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {finalSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting Interview...
                  </>
                ) : (
                  <>
                    <FiCheck size={14} />
                    Submit Interview
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================
          QUIT CONFIRMATION MODAL
      ====================================================== */}

      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#191B1E] p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#A1A1AA]">
              <FiAlertCircle size={18} />
            </div>

            <h2 className="mt-5 text-lg font-semibold">Quit this interview?</h2>

            <p className="mt-2 text-sm leading-6 text-[#71717A]">
              Your submitted answers will be preserved, but this attempt will be
              marked as abandoned.
            </p>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setShowQuitModal(false)}
                disabled={quitting}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-medium text-white hover:bg-white/[0.08] disabled:opacity-50"
              >
                Continue
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
