import { useState } from "react";
import { motion } from "motion/react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { sendEmailVerification } from "firebase/auth";
import { toast } from "react-hot-toast";

import { auth } from "../utils/firebase";

const EmailVerification = ({ email, onVerified, onChangeEmail }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleCheckVerification = async () => {
    if (isChecking) return;

    try {
      setIsChecking(true);

      const user = auth.currentUser;

      if (!user) {
        toast.error("Your signup session has expired. Please sign up again.");
        return;
      }

      await user.reload();

      if (user.emailVerified) {
        toast.success("Email verified successfully.");
        onVerified();
        return;
      }

      toast.error("Your email is not verified yet. Please check your inbox.");
    } catch (error) {
      console.error("Email verification check failed:", error);

      toast.error("Unable to verify your email. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendVerification = async () => {
    if (isResending) return;

    try {
      setIsResending(true);

      const user = auth.currentUser;

      if (!user) {
        toast.error("Your signup session has expired. Please sign up again.");
        return;
      }

      if (user.emailVerified) {
        toast.success("Your email is already verified.");
        onVerified();
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

      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
        Email verification
      </p>

      <h4 className="mt-2 text-2xl font-semibold text-white">
        Check your email
      </h4>

      <p className="mt-3 text-sm leading-6 text-white/40">
        We&apos;ve sent a verification link to:
      </p>

      <p className="mt-1 break-all text-sm font-medium text-white/75">
        {email}
      </p>

      <p className="mt-5 text-sm leading-6 text-white/40">
        Open the email and click the verification link. Once verified, return
        here and continue.
      </p>

      <button
        type="button"
        onClick={handleCheckVerification}
        disabled={isChecking || isResending}
        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_10px_30px_rgba(0,0,0,0.20)] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isChecking ? "Checking..." : "I've verified my email"}

        {!isChecking && <FiArrowRight size={16} />}
      </button>

      <button
        type="button"
        onClick={handleResendVerification}
        disabled={isChecking || isResending}
        className="mt-5 flex w-full items-center justify-center text-xs font-medium text-white/45 transition-colors hover:text-white disabled:opacity-40"
      >
        {isResending ? "Sending..." : "Resend verification email"}
      </button>

      <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.025] p-4">
        <p className="text-xs leading-5 text-white/35">
          Didn&apos;t receive the email? Check your spam or junk folder, then
          try resending the verification email.
        </p>
      </div>
    </motion.div>
  );
};

export default EmailVerification;
