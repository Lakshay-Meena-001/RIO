import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { FiArrowLeft, FiMail, FiRefreshCw } from "react-icons/fi";
import { sendEmailVerification } from "firebase/auth";
import { toast } from "react-hot-toast";

import { auth } from "../../utils/firebase";

const EmailVerification = ({ email, onVerified, onChangeEmail }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const onVerifiedRef = useRef(onVerified);
  const completedRef = useRef(false);

  // Keep the latest callback without restarting the verification watcher.
  useEffect(() => {
    onVerifiedRef.current = onVerified;
  }, [onVerified]);

  useEffect(() => {
    let active = true;
    let checking = false;

    const checkVerification = async () => {
      if (!active || checking || completedRef.current) return;

      const user = auth.currentUser;
      if (!user) return;

      checking = true;
      try {
        await user.reload();
        if (!active || completedRef.current) return;

        if (user.emailVerified) {
          completedRef.current = true;
          setIsChecking(false);
          toast.success(
            "Email verified. Finishing your sign-in automatically…",
          );
          onVerifiedRef.current?.();
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        // Network interruptions are retried on the next interval/focus event.
        console.warn("Email verification status check failed:", error);
      } finally {
        checking = false;
      }
    };

    const handleResume = () => {
      if (document.visibilityState === "visible") checkVerification();
    };

    checkVerification();
    const intervalId = window.setInterval(checkVerification, 1800);
    window.addEventListener("focus", handleResume);
    document.addEventListener("visibilitychange", handleResume);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleResume);
      document.removeEventListener("visibilitychange", handleResume);
    };
  }, [email]);

  const handleResendVerification = async () => {
    if (isResending) return;

    try {
      setIsResending(true);
      const user = auth.currentUser;

      if (!user) {
        toast.error("Your sign-in session expired. Please sign in again.");
        return;
      }

      await user.reload();
      if (user.emailVerified) {
        if (!completedRef.current) {
          completedRef.current = true;
          onVerifiedRef.current?.();
        }
        return;
      }

      await sendEmailVerification(user);
      toast.success("Verification email sent again.");
    } catch (error) {
      console.error("Resend verification failed:", error);

      if (error?.code === "auth/too-many-requests") {
        toast.error(
          "Too many verification emails requested. Please try again later.",
        );
      } else {
        toast.error(
          "Unable to resend the verification email. Please try again.",
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.section
      key="email-verification"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      aria-labelledby="email-verification-title"
      className="mx-auto mt-5 w-full max-w-[440px] sm:mt-7"
    >
      <button
        type="button"
        onClick={onChangeEmail}
        disabled={isChecking || isResending}
        className="group mb-6 inline-flex min-h-9 items-center gap-2 rounded-full text-xs font-medium text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-40 sm:mb-8"
      >
        <FiArrowLeft
          size={14}
          className="transition-transform group-hover:-translate-x-0.5"
        />
        Change email
      </button>

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <FiMail size={21} aria-hidden="true" />
      </div>

      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
        One last step
      </p>
      <h4
        id="email-verification-title"
        className="mt-2 text-[25px] font-semibold tracking-[-0.035em] text-white sm:text-[28px]"
      >
        Check your email
      </h4>
      <p className="mt-2 text-sm leading-6 text-white/50">
        Open the verification link we sent to:
      </p>
      <p className="mt-2 break-all rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-3 text-sm font-medium leading-5 text-white/85">
        {email}
      </p>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-white/70">
          {isChecking ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
          ) : (
            <FiRefreshCw size={14} aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white/75">
            {isChecking
              ? "Checking verification"
              : "Waiting for your confirmation"}
          </p>
          <p className="mt-1 text-xs leading-5 text-white/45">
            {isChecking
              ? "We’re checking your account status. This usually takes a moment."
              : "We’ll detect the verification automatically and continue your sign-in."}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleResendVerification}
        disabled={isResending || isChecking}
        className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-xs font-semibold text-white/65 transition-colors hover:border-white/20 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiRefreshCw
          size={13}
          className={isResending ? "animate-spin" : ""}
          aria-hidden="true"
        />
        {isResending
          ? "Sending verification email…"
          : "Resend verification email"}
      </button>

      <p className="mt-4 text-center text-[11px] leading-5 text-white/30">
        Can’t find it? Check your spam or junk folder.
      </p>
    </motion.section>
  );
};

export default EmailVerification;
