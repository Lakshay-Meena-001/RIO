import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiX,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { MdPhoneIphone } from "react-icons/md";
import { SiFirebase } from "react-icons/si";
import { signInWithPopup } from "firebase/auth";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { auth, provider, githubProvider } from "../utils/firebase";
import api from "../utils/axios";

const RioMark = ({ className = "h-10 w-10" }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M14 8.5H26.5C33.4 8.5 37.5 12.2 37.5 17.7C37.5 22.3 34.6 25.3 30.1 26.2L38.3 38H31.5L24.2 27.4H19.8V38H14V8.5Z"
      stroke="#F5F5F5"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M19.8 14.2H26C29.6 14.2 31.7 15.5 31.7 17.9C31.7 20.3 29.6 21.7 26 21.7H19.8"
      stroke="#F5F5F5"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <circle cx="38" cy="38" r="2.3" fill="#F5F5F5" />
  </svg>
);

const Loginmodel = ({ onClose, setUser }) => {
  const [authMode, setAuthMode] = useState("login");
  const [method, setMethod] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleSocialAuth = async (authProvider, providerName) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const result = await signInWithPopup(auth, authProvider);
      const token = await result.user.getIdToken();

      const response = await api.post("/api/auth/login", { token });

      toast.success(`${providerName} login successful`);

      setUser(response?.data?.user)

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

  const onSubmit = async (data) => {
    console.log("Email authentication:", {
      authMode,
      ...data,
    });

    toast("Email authentication will be connected next.");
  };

  const switchMode = (nextMode) => {
    setAuthMode(nextMode);
    setMethod("email");
    setOtpStep(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-[#111315]/65 p-4 backdrop-blur-[3px] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      {/* The backdrop stays transparent enough to reveal the exact Home atmosphere. */}
      <div className="flex min-h-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="relative flex h-[min(680px,calc(100vh-32px))] w-full max-w-[1040px] overflow-hidden rounded-[28px] border border-white/20 bg-[#17191C]/90 shadow-[0_30px_100px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_0_32px_rgba(255,255,255,0.035)] backdrop-blur-[38px]"
          style={{
            WebkitBackdropFilter: "blur(38px) saturate(175%)",
            backdropFilter: "blur(38px) saturate(175%)",
          }}
        >
          {/* Frosted highlight layers */}
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
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
                    <RioMark className="h-9 w-9" />
                  </div>

                  <div className="leading-none">
                    <p
                      className="text-[16px] font-bold tracking-[0.22em] text-white"
                      style={{
                        fontFamily: '"Space Grotesk", "Inter", sans-serif',
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
            <div
              className="min-h-0 overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.15) transparent",
              }}
            >
              <div className="min-h-full p-7 pb-9 sm:p-9 sm:pb-10">
                <div className="pr-12">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75/75">
                    {authMode === "login" ? "Sign in" : "Create account"}
                  </p>

                  <h3 className="mt-2 text-[30px] font-semibold tracking-[-0.035em] text-white">
                    {authMode === "login"
                      ? "Welcome to RIO."
                      : "Create your account."}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/40">
                    {authMode === "login"
                      ? "Continue building your career intelligence."
                      : "Start building your personalized career intelligence."}
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {otpStep ? (
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

                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75/75">
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
                        className="mt-4 text-xs font-medium text-white/75/80 hover:text-white"
                      >
                        Resend code
                      </button>

                      <button
                        type="button"
                        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_10px_30px_rgba(0,0,0,0.20)] transition-colors hover:bg-[#F5F5F5]"
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

                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75/75">
                        Phone
                      </p>

                      <h4 className="mt-2 text-2xl font-semibold text-white">
                        Continue with phone
                      </h4>

                      <p className="mt-2 text-sm leading-6 text-white/40">
                        We&apos;ll send a verification code to your mobile
                        number.
                      </p>

                      <div className="mt-7 flex h-12 overflow-hidden rounded-xl border border-white/10 bg-white/[0.045] focus-within:border-cyan-300/45">
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
                              autoComplete={
                                authMode === "login"
                                  ? "current-password"
                                  : "new-password"
                              }
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

                          {errors.password && (
                            <p className="mt-1.5 text-xs text-red-400">
                              {errors.password.message}
                            </p>
                          )}
                        </div>

                        {authMode === "login" && (
                          <button
                            type="button"
                            className="text-xs text-white/35 transition-colors hover:text-white/75"
                          >
                            Forgot password?
                          </button>
                        )}

                        <button
                          type="submit"
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-[#17191C] shadow-[0_12px_35px_rgba(0,0,0,0.24)] transition-colors hover:bg-[#F5F5F5]"
                        >
                          {authMode === "login"
                            ? "Continue with email"
                            : "Create account"}
                          <FiArrowRight size={16} />
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
  );
};

export default Loginmodel;
