import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { FiArrowLeft, FiMail, FiRefreshCw } from "react-icons/fi";
import { sendEmailVerification } from "firebase/auth";
import { toast } from "react-hot-toast";

import { auth } from "../utils/firebase";

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
    <motion.div
      key="email-verification"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.18 }}
      className="mt-8"
    >
      <button
        type="button"
        onClick={onChangeEmail}
        disabled={isChecking || isResending}
        className="mb-8 flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white disabled:opacity-40"
      >
        <FiArrowLeft size={14} />
        Change email
      </button>

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/80">
        <FiMail size={21} />
      </div>

      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
        Email verification
      </p>

      <h4 className="mt-2 text-2xl font-semibold text-white">
        Check your email
      </h4>

      <p className="mt-3 text-sm leading-6 text-white/45">
        We sent a verification link to this address:
      </p>

      <p className="mt-1 break-all text-sm font-medium text-white/85">
        {email}
      </p>

      <p className="mt-5 text-sm leading-6 text-white/45">
        Open the email and tap the verification link. Keep this page open or
        return to it afterward.
      </p>

      <div className="mt-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        {isChecking ? (
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
        ) : (
          <FiRefreshCw size={17} className="shrink-0 text-white/65" />
        )}
        <p className="text-xs leading-5 text-white/55">
          {isChecking
            ? "Waiting for verification…"
            : "We’ll detect verification automatically and continue. No confirmation button is needed."}
        </p>
      </div>

      <button
        type="button"
        onClick={handleResendVerification}
        disabled={isResending || isChecking}
        className="mt-5 flex w-full items-center justify-center gap-2 text-xs font-medium text-white/50 transition-colors hover:text-white disabled:opacity-40"
      >
        <FiRefreshCw size={13} />
        {isResending ? "Sending…" : "Resend verification email"}
      </button>

      <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.025] p-4">
        <p className="text-xs leading-5 text-white/35">
          If it doesn’t arrive, check your spam or junk folder. This page will
          continue automatically after verification is detected.
        </p>
      </div>
    </motion.div>
  );
};

export default EmailVerification;
