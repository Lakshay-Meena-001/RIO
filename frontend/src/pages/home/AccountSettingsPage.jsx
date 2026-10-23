import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiEdit3,
  FiKey,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiShield,
  FiX,
} from "react-icons/fi";
import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail,
  updatePhoneNumber,
} from "firebase/auth";
import { auth } from "../../utils/firebase";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import Sidebar from "../../components/SideBar";
import MobileHeader from "../../components/MobileHeader";
import Surface from "../../components/ui/Surface";
import PageEyebrow from "../../components/ui/PageEyebrow";

const ease = [0.22, 1, 0.36, 1];

function EditButton({ editing, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3.5 text-[11px] font-semibold text-[#D4D4D8] transition hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white disabled:opacity-40"
    >
      {editing ? (
        <>
          <FiX size={13} className="hidden sm:inline" /> Cancel
        </>
      ) : (
        <>
          <FiEdit3 size={13} className="hidden sm:inline" /> Edit
        </>
      )}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777A82]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="min-h-11 w-full rounded-xl border border-white/[0.10] bg-[#17191C] px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/25 focus:ring-2 focus:ring-white/[0.05]"
      />
    </label>
  );
}

const friendlyError = (err, fallback) => {
  const code = err?.code;
  if (code === "auth/email-already-in-use")
    return "This email is already linked to another account.";
  if (code === "auth/invalid-email")
    return "Please enter a valid email address.";
  if (code === "auth/requires-recent-login")
    return "For security, sign in again before changing account details.";
  if (code === "auth/too-many-requests")
    return "Too many attempts. Please try again later.";
  return err?.response?.data?.message || err?.message || fallback;
};

export default function AccountSettingsPage({ user, setUser }) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editing, setEditing] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const recaptchaRef = useRef(null);

  const email = user?.email || auth.currentUser?.email || "";
  const phone =
    user?.phoneNumber || user?.phone || auth.currentUser?.phoneNumber || "";
  const emailVerified = Boolean(
    auth.currentUser?.emailVerified || user?.emailVerified,
  );
  const phoneVerified = Boolean(
    auth.currentUser?.phoneNumber || user?.phoneNumber,
  );

  useEffect(
    () => () => {
      try {
        recaptchaRef.current?.clear?.();
      } catch {}
      recaptchaRef.current = null;
    },
    [],
  );

  const syncUser = async () => {
    const current = auth.currentUser;
    if (!current)
      throw new Error("Your session expired. Please sign in again.");
    await current.reload();
    const token = await current.getIdToken(true);
    const response = await api.post("/api/auth/login", { token });
    if (response.data?.user) setUser?.(response.data.user);
  };

  const beginEdit = (section) => {
    setEditing(section);
    if (section === "email") setEmailDraft(email);
    if (section === "phone") {
      setPhoneDraft("");
      setOtp("");
      setVerificationId("");
    }
  };

  const saveEmail = async (event) => {
    event.preventDefault();
    const nextEmail = emailDraft.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail))
      return toast.error("Enter a valid email address.");
    if (nextEmail === email.toLowerCase())
      return toast.error("This is already your current email.");
    if (!auth.currentUser) return toast.error("Please sign in again.");
    setBusy(true);
    try {
      await verifyBeforeUpdateEmail(auth.currentUser, nextEmail);
      toast.success(
        `Verification link sent to ${nextEmail}. Verify it, then return and refresh.`,
      );
      setEditing("");
    } catch (err) {
      toast.error(
        friendlyError(err, "Could not send the email verification link."),
      );
    } finally {
      setBusy(false);
    }
  };

  const sendPhoneCode = async (event) => {
    event.preventDefault();
    const raw = phoneDraft.trim().replace(/[^\d+]/g, "");
    const number = raw.startsWith("+") ? raw : `+91${raw}`;
    if (!/^\+[1-9]\d{7,14}$/.test(number))
      return toast.error(
        "Enter a valid number with country code, e.g. +91XXXXXXXXXX.",
      );
    if (!auth.currentUser) return toast.error("Please sign in again.");
    setBusy(true);
    try {
      if (!recaptchaRef.current)
        recaptchaRef.current = new RecaptchaVerifier(
          auth,
          "settings-phone-recaptcha",
          { size: "invisible" },
        );
      const provider = new PhoneAuthProvider(auth);
      setVerificationId(
        await provider.verifyPhoneNumber(number, recaptchaRef.current),
      );
      setPhoneDraft(number);
      toast.success("OTP sent. Enter the 6-digit code.");
    } catch (err) {
      try {
        recaptchaRef.current?.clear?.();
      } catch {}
      recaptchaRef.current = null;
      toast.error(
        friendlyError(
          err,
          "Could not send OTP. Check the number and try again.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const verifyPhone = async (event) => {
    event.preventDefault();
    if (!verificationId || !/^\d{6}$/.test(otp.trim()))
      return toast.error("Enter the 6-digit OTP.");
    setBusy(true);
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        otp.trim(),
      );
      await updatePhoneNumber(auth.currentUser, credential);
      await syncUser();
      setEditing("");
      setVerificationId("");
      setOtp("");
      setPhoneDraft("");
      toast.success("Phone number verified and updated.");
    } catch (err) {
      toast.error(friendlyError(err, "Could not verify this phone number."));
    } finally {
      setBusy(false);
    }
  };

  const refreshAccount = async () => {
    setRefreshing(true);
    try {
      await syncUser();
      toast.success("Account details refreshed.");
    } catch (err) {
      toast.error(friendlyError(err, "Could not refresh account details."));
    } finally {
      setRefreshing(false);
    }
  };

  const resetPassword = async () => {
    if (!email) return toast.error("Link an email address first.");
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(`Password reset link sent to ${email}.`);
    } catch (err) {
      toast.error(friendlyError(err, "Could not send password reset email."));
    } finally {
      setBusy(false);
    }
  };

  const status = (good, yes, no) => (
    <span className="inline-flex items-center gap-1.5 text-[10px] text-[#858994]">
      <span
        className={`h-1.5 w-1.5 rounded-full ${good ? "bg-emerald-400" : "bg-white/25"}`}
      />
      {good ? yes : no}
    </span>
  );

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#17191C] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 88% 4%, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.02) 42%, transparent 72%), radial-gradient(ellipse 65% 55% at 0% 92%, rgba(255,255,255,0.03) 0%, transparent 70%), linear-gradient(135deg, #191b1e 0%, #17191c 48%, #141619 100%)",
        }}
      />
      <MobileHeader onOpenNavigation={() => setMobileOpen(true)} user={user} />
      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          user={user}
          setUser={setUser}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main
          className={`min-w-0 flex-1 transition-[margin-left] duration-300 ease-out ${sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"}`}
        >
          <div className="mx-auto w-full max-w-[1480px] px-5 pb-10 pt-[88px] sm:px-7 lg:px-10 lg:pt-10">
            <motion.header
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
              className="mb-9"
            >
              <PageEyebrow className="mb-4">Account</PageEyebrow>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-3xl">
                  <h1 className="text-[38px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[50px] lg:text-[58px]">
                    Your account,
                    <span className="mt-2 block font-serif font-normal italic tracking-[-0.055em] text-[#A1A1AA]">
                      under your control.
                    </span>
                  </h1>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-[#92949B]">
                    Manage the email, phone number, and security details
                    connected to your RIO account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={refreshAccount}
                  disabled={refreshing}
                  className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-[#D4D4D8] transition hover:border-white/[0.18] hover:bg-white/[0.065] disabled:opacity-50 sm:self-auto"
                >
                  <FiRefreshCw
                    className={refreshing ? "animate-spin" : ""}
                    size={13}
                  />{" "}
                  Refresh details
                </button>
              </div>
            </motion.header>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
              <div className="space-y-5">
                <motion.section
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <Surface className="shadow-[0_22px_60px_rgba(0,0,0,0.16)]">
                    <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#D4D4D8]">
                          <FiMail size={17} />
                        </span>
                        <div>
                          <h2 className="text-sm font-semibold">
                            Email address
                          </h2>
                          <p className="mt-1 text-[11px] text-[#777A82]">
                            Used for sign-in and recovery
                          </p>
                        </div>
                      </div>
                      <EditButton
                        editing={editing === "email"}
                        onClick={() =>
                          editing === "email"
                            ? setEditing("")
                            : beginEdit("email")
                        }
                        disabled={busy}
                      />
                    </div>
                    <div className="p-5 sm:p-6">
                      {editing === "email" ? (
                        <form onSubmit={saveEmail} className="space-y-4">
                          <Field
                            label="Email address"
                            value={emailDraft}
                            onChange={(e) => setEmailDraft(e.target.value)}
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                          />
                          <p className="text-[11px] leading-5 text-[#777A82]">
                            A verification link will be sent to the new email.
                            It won't be changed until you verify it.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              disabled={busy}
                              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-[#E8E8EB] disabled:opacity-50"
                            >
                              {busy ? "Sending…" : "Send verification link"}{" "}
                              <FiArrowRight size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditing("")}
                              className="min-h-10 rounded-full border border-white/10 px-4 py-3 text-xs text-[#D4D4D8] hover:bg-white/[0.05]"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="break-all text-sm font-medium text-[#E4E4E7]">
                              {email || "No email linked"}
                            </p>
                            <p className="mt-2">
                              {status(
                                emailVerified,
                                "Verified",
                                "Verification needed",
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Surface>
                </motion.section>

                <motion.section
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05, ease }}
                >
                  <Surface className="shadow-[0_22px_60px_rgba(0,0,0,0.16)]">
                    <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#D4D4D8]">
                          <FiPhone size={17} />
                        </span>
                        <div>
                          <h2 className="text-sm font-semibold">
                            Mobile number
                          </h2>
                          <p className="mt-1 text-[11px] text-[#777A82]">
                            Verified contact for account access
                          </p>
                        </div>
                      </div>
                      <EditButton
                        editing={editing === "phone"}
                        onClick={() =>
                          editing === "phone"
                            ? setEditing("")
                            : beginEdit("phone")
                        }
                        disabled={busy}
                      />
                    </div>
                    <div className="p-5 sm:p-6">
                      {editing === "phone" ? (
                        <form
                          onSubmit={
                            verificationId ? verifyPhone : sendPhoneCode
                          }
                          className="space-y-4"
                        >
                          {!verificationId ? (
                            <Field
                              label="New mobile number"
                              value={phoneDraft}
                              onChange={(e) => setPhoneDraft(e.target.value)}
                              type="tel"
                              autoComplete="tel"
                              placeholder="+91 98765 43210"
                            />
                          ) : (
                            <>
                              <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-3 text-xs text-[#92949B]">
                                OTP sent to{" "}
                                <span className="text-white">{phoneDraft}</span>
                              </div>
                              <Field
                                label="6-digit verification code"
                                value={otp}
                                onChange={(e) =>
                                  setOtp(
                                    e.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 6),
                                  )
                                }
                                autoComplete="one-time-code"
                                placeholder="000000"
                              />
                            </>
                          )}
                          <div id="settings-phone-recaptcha" />
                          <div className="flex flex-wrap gap-2">
                            <button
                              disabled={
                                busy ||
                                (verificationId && otp.length !== 6) ||
                                (!verificationId && !phoneDraft.trim())
                              }
                              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition hover:bg-[#E8E8EB] disabled:opacity-50"
                            >
                              {busy
                                ? "Please wait…"
                                : verificationId
                                  ? "Verify and save"
                                  : "Send OTP"}{" "}
                              <FiArrowRight size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditing("");
                                setVerificationId("");
                                setOtp("");
                              }}
                              className="min-h-10 rounded-full border border-white/10 px-4 py-3 text-xs text-[#D4D4D8] hover:bg-white/[0.05]"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div>
                          <p className="break-all text-sm font-medium text-[#E4E4E7]">
                            {phone || "No phone linked"}
                          </p>
                          <p className="mt-2">
                            {status(
                              phoneVerified,
                              "Linked to this account",
                              "Not linked",
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </Surface>
                </motion.section>

                <motion.section
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1, ease }}
                >
                  <Surface className="shadow-[0_22px_60px_rgba(0,0,0,0.16)]">
                    <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#D4D4D8]">
                          <FiKey size={17} />
                        </span>
                        <div>
                          <h2 className="text-sm font-semibold">
                            Password & recovery
                          </h2>
                          <p className="mt-1 text-[11px] text-[#777A82]">
                            Recover access securely
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={resetPassword}
                        disabled={busy || !email}
                        className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3.5 text-[11px] font-semibold text-[#D4D4D8] transition hover:border-white/[0.18] hover:bg-white/[0.065] disabled:opacity-40"
                      >
                        <FiRefreshCw  className="hidden sm:inline" size={12} /> Reset
                      </button>
                    </div>
                    <div className="p-5 sm:p-6">
                      <p className="text-sm leading-6 text-[#92949B]">
                        We'll send a password reset link to your current account
                        email.
                      </p>
                      <p className="mt-3 text-[11px] text-[#777A82]">
                        {email
                          ? `Recovery email: ${email}`
                          : "Add an email address before requesting a reset."}
                      </p>
                    </div>
                  </Surface>
                </motion.section>
              </div>

              <aside className="space-y-5">
                <Surface className="shadow-[0_22px_60px_rgba(0,0,0,0.16)]">
                  <div className="p-5 sm:p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#D4D4D8]">
                      <FiShield size={19} />
                    </span>
                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.20em] text-[#777A82]">
                      Account security
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
                      Your details stay yours.
                    </h2>
                    <p className="mt-3 text-xs leading-6 text-[#858994]">
                      Email changes require verification. Phone changes require
                      a one-time code, so a contact method is only updated after
                      ownership is confirmed.
                    </p>
                    <div className="my-5 border-t border-white/[0.08]" />
                    <div className="space-y-3 text-xs text-[#92949B]">
                      <p className="flex items-center gap-2">
                        <FiCheck className="text-[#D4D4D8]" /> Email
                        verification
                      </p>
                      <p className="flex items-center gap-2">
                        <FiCheck className="text-[#D4D4D8]" /> Phone OTP
                        verification
                      </p>
                      <p className="flex items-center gap-2">
                        <FiCheck className="text-[#D4D4D8]" /> Secure password
                        recovery
                      </p>
                    </div>
                  </div>
                </Surface>
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="group flex w-full items-center justify-between rounded-[22px] border border-white/[0.10] bg-[#111315] p-5 text-left transition hover:border-white/20"
                >
                  <span>
                    <span className="block text-sm font-semibold">
                      Profile details
                    </span>
                    <span className="mt-1 block text-xs text-[#777A82]">
                      Return to your professional profile
                    </span>
                  </span>
                  <FiArrowRight className="text-[#777A82] transition group-hover:translate-x-0.5 group-hover:text-white" />
                </button>
              </aside>
            </div>
            <p className="mt-9 border-t border-white/[0.08] pt-6 text-center text-[10px] tracking-wide text-white/20">
              RIO · CAREER INTELLIGENCE · YOUR DATA, YOUR ACCOUNT
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
