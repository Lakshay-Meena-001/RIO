import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiX,
} from "react-icons/fi";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../utils/firebase";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const oobCode = searchParams.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [codeValid, setCodeValid] = useState(false);

  useState(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setError("This password reset link is invalid or incomplete.");
        setIsCheckingCode(false);
        return;
      }

      try {
        await verifyPasswordResetCode(auth, oobCode);

        setCodeValid(true);
      } catch (error) {
        console.error("Password reset code verification failed:", error);

        if (error?.code === "auth/expired-action-code") {
          setError(
            "This password reset link has expired. Please request a new one.",
          );
        } else if (error?.code === "auth/invalid-action-code") {
          setError(
            "This password reset link is invalid or has already been used.",
          );
        } else {
          setError(
            "This password reset link is no longer valid. Please request a new one.",
          );
        }
      } finally {
        setIsCheckingCode(false);
      }
    };

    verifyCode();
  }, [oobCode]);

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setError("");

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      await confirmPasswordReset(auth, oobCode, password);

      setSuccess(true);
    } catch (error) {
      console.error("Password reset failed:", error);

      if (error?.code === "auth/expired-action-code") {
        setError(
          "This password reset link has expired. Please request a new one.",
        );
      } else if (error?.code === "auth/invalid-action-code") {
        setError(
          "This password reset link is invalid or has already been used.",
        );
      } else if (error?.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Unable to reset your password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-[#111315] p-4 sm:p-6">
      <div className="flex min-h-[calc(100vh-32px)] items-center justify-center sm:min-h-[calc(100vh-48px)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="relative flex h-[min(680px,calc(100vh-32px))] w-full max-w-[1040px] overflow-hidden rounded-[28px] border border-white/20 bg-[#17191C]/98 shadow-[0_30px_100px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_0_32px_rgba(255,255,255,0.035)] backdrop-blur-[48px]"
          style={{
            WebkitBackdropFilter: "blur(48px) saturate(180%)",
            backdropFilter: "blur(48px) saturate(180%)",
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/35" />

          <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/[0.08]" />

          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close password reset"
            className="absolute right-5 top-5 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition-colors hover:bg-white/[0.12] hover:text-white disabled:opacity-40"
          >
            <FiX size={18} />
          </button>

          <div className="grid min-h-0 w-full md:grid-cols-[0.9fr_1.1fr]">
            {/* Brand panel */}
            <div className="relative hidden min-h-0 overflow-hidden border-r border-white/10 p-9 md:flex md:flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.045] via-transparent to-white/[0.015]" />

              <div className="relative z-10">
                <div className="flex items-center">
                  <div className="leading-none">
                    <p
                      className="text-[16px] font-bold tracking-[0.22em] text-white"
                      style={{
                        fontFamily: '"Zen Dots", sans-serif',
                      }}
                    >
                      RIO
                    </p>

                    <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-white/35">
                      Career Intelligence
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 my-auto max-w-[320px]">
                <div className="mb-6 h-1 w-12 rounded-full bg-white" />

                <h2 className="text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-white">
                  Your career,
                  <span className="mt-2 block font-serif font-normal italic text-white/75">
                    with direction.
                  </span>
                </h2>

                <p className="mt-6 text-sm leading-7 text-white/45">
                  Practice, learn, measure your progress, and build a clearer
                  path toward the role you are targeting.
                </p>
              </div>

              <div className="relative z-10">
                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/25">
                  Practice · Improve · Grow
                </p>
              </div>
            </div>

            {/* Reset panel */}
            <div className="auth-panel-scroll min-h-0 overflow-y-auto">
              <div className="min-h-full p-7 pb-9 sm:p-9 sm:pb-10">
                <div className="pr-12">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
                    Password recovery
                  </p>

                  <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.035em] text-white">
                    {success ? "Password updated." : "Create a new password."}
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-white/40">
                    {success
                      ? "Your RIO account is secure. You can now sign in with your new password."
                      : "Choose a new password for your RIO account."}
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className="mt-8"
                >
                  {isCheckingCode ? (
                    <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-white" />

                      <p className="mt-5 text-sm text-white/50">
                        Verifying your reset link...
                      </p>
                    </div>
                  ) : success ? (
                    <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#17191C]">
                          <FiCheck size={20} />
                        </div>
                      </div>

                      <p className="mt-7 text-sm font-medium text-white/80">
                        Password changed successfully.
                      </p>

                      <p className="mx-auto mt-3 max-w-[380px] text-sm leading-6 text-white/40">
                        Your password has been updated. You can now continue to
                        your RIO account.
                      </p>

                      <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_12px_35px_rgba(0,0,0,0.24)] transition-colors hover:bg-[#F5F5F5]"
                      >
                        Go to sign in
                        <FiArrowRight size={16} />
                      </button>
                    </div>
                  ) : !codeValid ? (
                    <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/[0.05]">
                        <FiX size={22} className="text-red-400/80" />
                      </div>

                      <p className="mt-7 text-sm font-medium text-white/80">
                        Reset link unavailable
                      </p>

                      <p className="mx-auto mt-3 max-w-[380px] text-sm leading-6 text-white/40">
                        {error}
                      </p>

                      <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_12px_35px_rgba(0,0,0,0.24)] transition-colors hover:bg-[#F5F5F5]"
                      >
                        Back to sign in
                        <FiArrowLeft size={16} />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-white/60">
                          New password
                        </label>

                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) =>
                              setPassword(event.target.value)
                            }
                            placeholder="Create your new password"
                            autoComplete="new-password"
                            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 pr-11 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/30"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword((previous) => !previous)
                            }
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                          >
                            {showPassword ? (
                              <FiEyeOff size={17} />
                            ) : (
                              <FiEye size={17} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-white/60">
                          Confirm password
                        </label>

                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(event) =>
                              setConfirmPassword(event.target.value)
                            }
                            placeholder="Confirm your new password"
                            autoComplete="new-password"
                            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 pr-11 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/30"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword((previous) => !previous)
                            }
                            aria-label={
                              showConfirmPassword
                                ? "Hide confirm password"
                                : "Show confirm password"
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                          >
                            {showConfirmPassword ? (
                              <FiEyeOff size={17} />
                            ) : (
                              <FiEye size={17} />
                            )}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-400"
                        >
                          {error}
                        </motion.p>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_12px_35px_rgba(0,0,0,0.24)] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isLoading ? "Updating password..." : "Reset password"}

                        {!isLoading && <FiArrowRight size={16} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/")}
                        disabled={isLoading}
                        className="flex w-full items-center justify-center gap-2 text-xs font-medium text-white/40 transition-colors hover:text-white disabled:opacity-40"
                      >
                        <FiArrowLeft size={14} />
                        Back to sign in
                      </button>
                    </form>
                  )}
                </motion.div>

                <div className="mt-7 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.14em] text-white/18">
                  <span>RIO</span>
                  <span>·</span>
                  <span>Secure password recovery</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
