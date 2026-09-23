import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiX,
  FiMail,
  FiCheck,
} from "react-icons/fi";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { MdPhoneIphone } from "react-icons/md";
import { SiFirebase } from "react-icons/si";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { auth, provider, githubProvider } from "../utils/firebase";
import api from "../utils/axios";

import EmailVerification from "./EmailVerification";

const Loginmodel = ({ onClose, setUser }) => {
  const [authMode, setAuthMode] = useState("login");
  const [method, setMethod] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);

  const [emailVerificationStep, setEmailVerificationStep] = useState(false);
  const [passwordCreationStep, setPasswordCreationStep] = useState(false);

  const [passwordResetStep, setPasswordResetStep] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  const [verificationEmail, setVerificationEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const [forgotPasswordError, setForgotPasswordError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");

  // Supports both:
  // lakshaymeena2198
  // lakshaymeena2198@gmail.com
  const normalizeEmail = (value) => {
    const email = value?.trim().toLowerCase();

    if (!email) {
      return "";
    }

    return email.includes("@") ? email : `${email}@gmail.com`;
  };

  // Creates a readable fallback when a provider does not return a name.
  const getFallbackDisplayName = (email) => {
    const localPart = email.split("@")[0];

    return localPart
      .replace(/[._-]+/g, " ")
      .replace(/\d+/g, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleSocialAuth = async (authProvider, providerName) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const result = await signInWithPopup(auth, authProvider);
      const token = await result.user.getIdToken();

      const response = await api.post("/api/auth/login", {
        token,
      });

      toast.success(`${providerName} login successful`);

      setUser(response?.data?.user);

      onClose();
    } catch (error) {
      console.error(`${providerName} authentication failed:`, error);

      toast.error(
        error?.response?.data?.message ||
          `${providerName} authentication failed. Please try again.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailVerificationComplete = () => {
    setEmailVerificationStep(false);
    setPasswordCreationStep(true);
    setShowPassword(false);
    setShowConfirmPassword(false);

    reset({
      newPassword: "",
      confirmPassword: "",
    });

    toast.success("Email verified. Now create your password.");
  };

  const handlePasswordCreation = async (data) => {
    if (isLoading) return;

    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      const user = auth.currentUser;

      if (!user) {
        toast.error("Your signup session has expired. Please sign up again.");
        return;
      }

      await updatePassword(user, data.newPassword);

      const token = await user.getIdToken(true);

      const response = await api.post("/api/auth/login", {
        token,
      });

      toast.success("Account created successfully.");

      setUser(response?.data?.user);

      onClose();
    } catch (error) {
      console.error("Password creation failed:", error);

      if (error?.code === "auth/requires-recent-login") {
        toast.error(
          "Your signup session expired. Please start the signup process again.",
        );
      } else if (error?.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters.");
      } else {
        toast.error("Unable to create your password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (isLoading) return;

    setForgotPasswordError("");

    const email = normalizeEmail(watch("email"));

    if (!email) {
      setForgotPasswordError("Email is required.");
      return;
    }

    if (!email.includes("@") || !email.split("@")[1]) {
      setForgotPasswordError("Please enter a valid email address.");
      return;
    }

    try {
      setIsLoading(true);

      await sendPasswordResetEmail(auth, email);

      setResetEmail(email);
      setPasswordResetSent(true);

      toast.success("Password reset email sent.");
    } catch (error) {
      console.error("Password reset failed:", error);

      const errorMessages = {
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/user-not-found": "No account exists with this email.",
        "auth/too-many-requests": "Too many requests. Please try again later.",
        "auth/network-request-failed":
          "Network error. Please check your connection.",
      };

      const message =
        errorMessages[error?.code] ||
        "Unable to send password reset email. Please try again.";

      setForgotPasswordError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromPasswordReset = () => {
    if (isLoading) return;

    setPasswordResetStep(false);
    setPasswordResetSent(false);
    setResetEmail("");
    setForgotPasswordError("");
  };

  const handleExistingAccount = (email) => {
    setAuthMode("login");
    setMethod("email");
    setOtpStep(false);
    setEmailVerificationStep(false);
    setPasswordCreationStep(false);
    setPasswordResetStep(false);
    setPasswordResetSent(false);
    setVerificationEmail("");
    setResetEmail("");
    setForgotPasswordError("");
    setShowPassword(false);
    setShowConfirmPassword(false);

    reset({
      email,
      password: "",
    });

    toast.error(
      "An account already exists with this email. Please sign in instead.",
    );
  };

  const onSubmit = async (data) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const email = normalizeEmail(data.email);

      // Email signup.
      if (authMode === "register") {
        const displayName =
          data.name?.trim() || getFallbackDisplayName(email) || "User";

        const generatedPassword = `${crypto.randomUUID()}Aa1!`;

        const { user } = await createUserWithEmailAndPassword(
          auth,
          email,
          generatedPassword,
        );

        await updateProfile(user, {
          displayName,
        });

        await sendEmailVerification(user);

        setVerificationEmail(user.email);
        setEmailVerificationStep(true);

        reset();

        toast.success("Verification email sent.");

        return;
      }

      // Email login.
      if (authMode === "login") {
        const { user } = await signInWithEmailAndPassword(
          auth,
          email,
          data.password,
        );

        if (!user.emailVerified) {
          setVerificationEmail(user.email);
          setEmailVerificationStep(true);

          toast.error("Please verify your email before continuing.");

          return;
        }

        const token = await user.getIdToken();

        const response = await api.post("/api/auth/login", {
          token,
        });

        toast.success("Login successful.");

        setUser(response?.data?.user);

        onClose();
      }
    } catch (error) {
      console.error("Email authentication failed:", error);

      if (error?.code === "auth/email-already-in-use") {
        handleExistingAccount(normalizeEmail(data.email));
        return;
      }

      const errorMessages = {
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/invalid-credential":
          "Invalid email or password. Please try again.",
        "auth/user-not-found": "No account exists with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/weak-password": "Password should be at least 6 characters.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/network-request-failed":
          "Network error. Please check your connection.",
      };

      toast.error(
        errorMessages[error?.code] ||
          "Authentication failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (isLoading) return;

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to reset signup session:", error);
    }

    setEmailVerificationStep(false);
    setPasswordCreationStep(false);
    setPasswordResetStep(false);
    setPasswordResetSent(false);
    setVerificationEmail("");
    setResetEmail("");
    setForgotPasswordError("");
    setAuthMode("register");
    setMethod("email");
    setShowPassword(false);
    setShowConfirmPassword(false);

    reset();
  };

  const switchMode = async (nextMode) => {
    if (isLoading) return;

    if (auth.currentUser) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Failed to reset authentication state:", error);
      }
    }

    setAuthMode(nextMode);
    setMethod("email");
    setOtpStep(false);
    setEmailVerificationStep(false);
    setPasswordCreationStep(false);
    setPasswordResetStep(false);
    setPasswordResetSent(false);
    setVerificationEmail("");
    setResetEmail("");
    setForgotPasswordError("");
    setShowPassword(false);
    setShowConfirmPassword(false);

    reset();
  };

  return (
    <>
      <style>{`
        .auth-panel-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .auth-panel-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>

      <div
        className="fixed inset-0 z-[100] overflow-y-auto bg-[#111315]/88 p-4 backdrop-blur-[16px] sm:p-6"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !isLoading) {
            onClose();
          }
        }}
      >
        <div className="flex min-h-full items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
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
              onClick={onClose}
              disabled={isLoading}
              aria-label="Close authentication modal"
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

              {/* Auth panel */}
              <div className="auth-panel-scroll min-h-0 overflow-y-auto">
                <div className="min-h-full p-7 pb-9 sm:p-9 sm:pb-10">
                  <div className="pr-12">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
                      {authMode === "login"
                        ? passwordResetStep
                          ? "Password recovery"
                          : "Sign in"
                        : passwordCreationStep
                          ? "Secure your account"
                          : "Create account"}
                    </p>

                    <h3 className="mt-2 text-[30px] font-semibold tracking-[-0.035em] text-white">
                      {passwordResetStep ? (
                        passwordResetSent ? (
                          "Check your email."
                        ) : (
                          "Reset your password."
                        )
                      ) : passwordCreationStep ? (
                        "Create your password."
                      ) : authMode === "login" ? (
                        <>
                          <span
                            style={{
                              fontFamily: "sans-serif",
                              fontSize: 24,
                              fontWeight: 400,
                            }}
                          >
                            Welcome to{" "}
                          </span>
                          <span
                            style={{
                              fontFamily: '"Zen Dots", sans-serif',
                            }}
                          >
                            RIO
                          </span>
                          .
                        </>
                      ) : (
                        "Create your account."
                      )}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-white/40">
                      {passwordResetStep
                        ? passwordResetSent
                          ? "We sent a secure password reset link to your email address."
                          : "Enter your email and we’ll send you a secure reset link."
                        : passwordCreationStep
                          ? "Your email is verified. Choose a password to finish your account."
                          : authMode === "login"
                            ? "Continue building your career intelligence."
                            : "Start building your personalized career intelligence."}
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {passwordResetStep ? (
                      <motion.div
                        key="password-reset"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.18 }}
                        className="mt-8"
                      >
                        {passwordResetSent ? (
                          <>
                            <div className="flex items-center justify-center">
                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#17191C]">
                                  <FiCheck size={20} />
                                </div>
                              </div>
                            </div>

                            <div className="mt-7 text-center">
                              <p className="text-sm font-medium text-white/80">
                                Reset email sent
                              </p>

                              <p className="mt-3 break-all text-sm font-medium text-white">
                                {resetEmail}
                              </p>

                              <p className="mx-auto mt-4 max-w-[390px] text-sm leading-6 text-white/40">
                                Open your inbox and follow the secure link to
                                create a new password for your RIO account.
                              </p>
                            </div>

                            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                              <div className="flex gap-3">
                                <FiMail
                                  className="mt-0.5 shrink-0 text-white/45"
                                  size={16}
                                />

                                <p className="text-xs leading-5 text-white/35">
                                  Didn&apos;t receive it? Check your spam or
                                  junk folder, then try sending the reset email
                                  again.
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setPasswordResetSent(false);
                                setForgotPasswordError("");
                              }}
                              disabled={isLoading}
                              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_10px_30px_rgba(0,0,0,0.20)] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Send again
                            </button>

                            <button
                              type="button"
                              onClick={handleBackFromPasswordReset}
                              disabled={isLoading}
                              className="mt-4 flex w-full items-center justify-center gap-2 text-xs font-medium text-white/40 transition-colors hover:text-white disabled:opacity-40"
                            >
                              <FiArrowLeft size={14} />
                              Back to sign in
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={handleBackFromPasswordReset}
                              disabled={isLoading}
                              className="mb-8 flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white disabled:opacity-40"
                            >
                              <FiArrowLeft size={14} />
                              Back to sign in
                            </button>

                            <label className="mb-2 block text-xs font-semibold text-white/60">
                              Email
                            </label>

                            <input
                              type="email"
                              {...register("email")}
                              placeholder="you@example.com"
                              autoComplete="email"
                              className={`h-12 w-full rounded-xl border ${
                                forgotPasswordError
                                  ? "border-red-400/40"
                                  : "border-white/10"
                              } bg-white/[0.045] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/30`}
                            />

                            {forgotPasswordError && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 text-xs text-red-400"
                              >
                                {forgotPasswordError}
                              </motion.p>
                            )}

                            <button
                              type="button"
                              onClick={handleForgotPassword}
                              disabled={isLoading}
                              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_12px_35px_rgba(0,0,0,0.24)] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isLoading
                                ? "Sending reset email..."
                                : "Send reset link"}

                              {!isLoading && <FiArrowRight size={16} />}
                            </button>
                          </>
                        )}
                      </motion.div>
                    ) : emailVerificationStep ? (
                      <EmailVerification
                        email={verificationEmail}
                        onVerified={handleEmailVerificationComplete}
                        onChangeEmail={handleChangeEmail}
                      />
                    ) : passwordCreationStep ? (
                      <motion.form
                        key="password-creation"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.18 }}
                        onSubmit={handleSubmit(handlePasswordCreation)}
                        className="mt-8 space-y-5"
                      >
                        <div>
                          <label className="mb-2 block text-xs font-semibold text-white/60">
                            Create password
                          </label>

                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              {...register("newPassword", {
                                required: "Password is required",
                                minLength: {
                                  value: 6,
                                  message:
                                    "Password should be at least 6 characters.",
                                },
                              })}
                              placeholder="Create your password"
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

                          {errors.newPassword && (
                            <p className="mt-1.5 text-xs text-red-400">
                              {errors.newPassword.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-semibold text-white/60">
                            Confirm password
                          </label>

                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              {...register("confirmPassword", {
                                required: "Please confirm your password",
                                validate: (value) =>
                                  value === newPassword ||
                                  "Passwords do not match.",
                              })}
                              placeholder="Confirm your password"
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

                          {errors.confirmPassword && (
                            <p className="mt-1.5 text-xs text-red-400">
                              {errors.confirmPassword.message}
                            </p>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_12px_35px_rgba(0,0,0,0.24)] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isLoading ? "Creating account..." : "Create account"}

                          {!isLoading && <FiArrowRight size={16} />}
                        </button>
                      </motion.form>
                    ) : otpStep ? (
                      <motion.div
                        key="otp"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-8"
                      >
                        <button
                          type="button"
                          onClick={() => setOtpStep(false)}
                          className="mb-8 flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white"
                        >
                          <FiArrowLeft size={14} />
                          Back
                        </button>

                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
                          Verification
                        </p>

                        <h4 className="mt-2 text-2xl font-semibold text-white">
                          Verify your number
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-white/40">
                          Enter the verification code sent to your phone.
                        </p>

                        <input
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Enter 6-digit code"
                          className="mt-7 h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 text-center text-lg tracking-[0.45em] text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/30"
                        />

                        <button
                          type="button"
                          className="mt-4 text-xs font-medium text-white/75 hover:text-white"
                        >
                          Resend code
                        </button>

                        <button
                          type="button"
                          className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-[#17191C]"
                        >
                          Verify & Continue
                          <FiArrowRight />
                        </button>
                      </motion.div>
                    ) : method === "phone" ? (
                      <motion.div
                        key="phone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-8"
                      >
                        <button
                          type="button"
                          onClick={() => setMethod("email")}
                          className="mb-8 flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white"
                        >
                          <FiArrowLeft size={14} />
                          Use email instead
                        </button>

                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
                          Phone
                        </p>

                        <h4 className="mt-2 text-2xl font-semibold text-white">
                          Continue with phone
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-white/40">
                          We&apos;ll send a verification code to your mobile
                          number.
                        </p>

                        <div className="mt-7 flex h-12 overflow-hidden rounded-xl border border-white/10 bg-white/[0.045] focus-within:border-white/30">
                          <span className="flex items-center border-r border-white/10 px-4 text-sm text-white/35">
                            +91
                          </span>

                          <input
                            type="tel"
                            placeholder="Mobile number"
                            className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/20"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => setOtpStep(true)}
                          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-[#17191C]"
                        >
                          Send verification code
                          <FiArrowRight />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={authMode}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-7"
                      >
                        <div className="grid h-11 grid-cols-2 rounded-xl border border-white/10 bg-[#111315]/55 p-1">
                          <button
                            type="button"
                            onClick={() => setMethod("email")}
                            className={`rounded-lg text-xs font-semibold transition-colors ${
                              method === "email"
                                ? "bg-white/[0.11] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                                : "text-white/35 hover:text-white/60"
                            }`}
                          >
                            Email
                          </button>

                          <button
                            type="button"
                            onClick={() => setMethod("phone")}
                            className={`flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-colors ${
                              method === "phone"
                                ? "bg-white/[0.11] text-white"
                                : "text-white/35 hover:text-white/60"
                            }`}
                          >
                            <MdPhoneIphone size={14} />
                            Phone
                          </button>
                        </div>

                        <form
                          onSubmit={handleSubmit(onSubmit)}
                          className="mt-6 space-y-4"
                        >
                          {authMode === "register" && (
                            <div>
                              <label className="mb-2 block text-xs font-semibold text-white/60">
                                Full name
                              </label>

                              <input
                                {...register("name", {
                                  required: "Name is required",
                                })}
                                placeholder="Your name"
                                autoComplete="name"
                                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/30"
                              />

                              {errors.name && (
                                <p className="mt-1.5 text-xs text-red-400">
                                  {errors.name.message}
                                </p>
                              )}
                            </div>
                          )}

                          <div>
                            <label className="mb-2 block text-xs font-semibold text-white/60">
                              Email
                            </label>

                            <input
                              type="email"
                              {...register("email", {
                                required: "Email is required",
                              })}
                              placeholder="you@example.com"
                              autoComplete="email"
                              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/30"
                            />

                            {errors.email && (
                              <p className="mt-1.5 text-xs text-red-400">
                                {errors.email.message}
                              </p>
                            )}
                          </div>

                          {authMode === "login" && (
                            <div>
                              <label className="mb-2 block text-xs font-semibold text-white/60">
                                Password
                              </label>

                              <div className="relative">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  {...register("password", {
                                    required: "Password is required",
                                  })}
                                  placeholder="Enter your password"
                                  autoComplete="current-password"
                                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 pr-11 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-white/30"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowPassword((previous) => !previous)
                                  }
                                  aria-label={
                                    showPassword
                                      ? "Hide password"
                                      : "Show password"
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

                              {errors.password && (
                                <p className="mt-1.5 text-xs text-red-400">
                                  {errors.password.message}
                                </p>
                              )}
                            </div>
                          )}

                          {authMode === "login" && (
                            <button
                              type="button"
                              onClick={() => {
                                setForgotPasswordError("");
                                setPasswordResetStep(true);
                                setPasswordResetSent(false);
                              }}
                              disabled={isLoading}
                              className="text-xs text-white/35 transition-colors hover:text-white/75 disabled:opacity-40"
                            >
                              Forgot password?
                            </button>
                          )}

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_12px_35px_rgba(0,0,0,0.24)] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isLoading
                              ? "Please wait..."
                              : "Continue with email"}

                            {!isLoading && <FiArrowRight size={16} />}
                          </button>
                        </form>

                        <div className="my-6 flex items-center gap-3">
                          <div className="h-px flex-1 bg-white/10" />

                          <span className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                            or continue with
                          </span>

                          <div className="h-px flex-1 bg-white/10" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleSocialAuth(provider, "Google")}
                            disabled={isLoading}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] text-xs font-semibold text-white/75 transition-colors hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-50"
                          >
                            <FcGoogle size={17} />
                            Google
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleSocialAuth(githubProvider, "GitHub")
                            }
                            disabled={isLoading}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] text-xs font-semibold text-white/75 transition-colors hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-50"
                          >
                            <FaGithub size={17} />
                            GitHub
                          </button>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-white/30">
                          {authMode === "login"
                            ? "Don't have an account?"
                            : "Already have an account?"}

                          <button
                            type="button"
                            onClick={() =>
                              switchMode(
                                authMode === "login" ? "register" : "login",
                              )
                            }
                            className="font-semibold text-white transition-transform duration-200 hover:scale-[1.02]"
                          >
                            {authMode === "login" ? "Create one" : "Sign in"}
                          </button>
                        </div>

                        <div className="mt-5 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.14em] text-white/18">
                          <SiFirebase size={11} />
                          Firebase secured
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Loginmodel;
