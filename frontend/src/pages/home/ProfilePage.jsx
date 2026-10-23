import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiArrowUpRight,
  FiBriefcase,
  FiCode,
  FiEdit3,
  FiExternalLink,
  FiGithub,
  FiGlobe,
  FiLinkedin,
  FiMapPin,
  FiRefreshCw,
  FiSave,
  FiTarget,
  FiUser,
  FiX,
  FiBookOpen,
  FiGitBranch,
  FiStar,
  FiUsers,
} from "react-icons/fi";

import toast from "react-hot-toast";
import Sidebar from "../../components/SideBar";
import { updateProfessionalProfile, logoutUser } from "../../api/user/user.api";
import PageEyebrow from "../../components/ui/PageEyebrow";
import MobileHeader from "../../components/MobileHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const ease = [0.22, 1, 0.36, 1];

const formFields = [
  {
    name: "headline",
    label: "Professional headline",
    placeholder: "Full-stack developer · MERN · AI",
    maxLength: 160,
  },
  {
    name: "currentRole",
    label: "Current role",
    placeholder: "Student, Software Engineer…",
    maxLength: 100,
  },
  {
    name: "targetRole",
    label: "Target role",
    placeholder: "Software Development Engineer",
    maxLength: 100,
  },
  {
    name: "location",
    label: "Location",
    placeholder: "City, Country",
    maxLength: 100,
  },
  {
    name: "githubUrl",
    label: "GitHub profile",
    placeholder: "https://github.com/username",
    maxLength: 300,
  },
  {
    name: "linkedinUrl",
    label: "LinkedIn profile",
    placeholder: "https://linkedin.com/in/username",
    maxLength: 300,
  },
  {
    name: "portfolioUrl",
    label: "Portfolio website",
    placeholder: "https://your-site.com",
    maxLength: 300,
  },
];

const Panel = ({ children, className = "" }) => (
  <section
    className={`relative overflow-hidden rounded-[22px] border border-white/[0.09] bg-[#111315] ${className}`}
  >
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_85%_at_100%_0%,rgba(255,255,255,0.045),transparent_68%)]"
    />
    <div className="relative">{children}</div>
  </section>
);

const IconButton = ({
  children,
  onClick,
  disabled,
  className = "",
  ...props
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.075] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const safeLink = (value) => {
  if (!value || typeof value !== "string") return "";
  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`,
    );
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
};

const getGithubUsername = (value) => {
  const url = safeLink(value || "");
  if (!url) return "";
  try {
    const host = new URL(url);
    if (!/(^|\.)github\.com$/i.test(host.hostname)) return "";
    return host.pathname.split("/").filter(Boolean)[0] || "";
  } catch {
    return "";
  }
};

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

const initialForm = (user) => ({
  headline: user?.headline || "",
  bio: user?.bio || "",
  location: user?.location || "",
  currentRole: user?.currentRole || "",
  targetRole: user?.targetRole || "",
  linkedinUrl: user?.linkedinUrl || "",
  githubUrl: user?.githubUrl || "",
  portfolioUrl: user?.portfolioUrl || "",
  skillsText: Array.isArray(user?.skills) ? user.skills.join(", ") : "",
});

export default function ProfilePage({ user, setUser }) {
  const editorRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [form, setForm] = useState(() => initialForm(user));
  const [github, setGithub] = useState({
    loading: false,
    error: "",
    user: null,
    repos: [],
  });

  const skills = Array.isArray(user?.skills) ? user.skills : [];
  const initials = (user?.name || "RIO")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const githubUsername = getGithubUsername(user?.githubUrl);
  const githubProfileUrl = safeLink(user?.githubUrl);
  const linkedinUrl = safeLink(user?.linkedinUrl);
  const portfolioUrl = safeLink(user?.portfolioUrl);

  useEffect(() => {
    if (!githubUsername) {
      setGithub({ loading: false, error: "", user: null, repos: [] });
      return undefined;
    }
    const controller = new AbortController();
    setGithub((current) => ({ ...current, loading: true, error: "" }));
    Promise.all([
      fetch(
        `https://api.github.com/users/${encodeURIComponent(githubUsername)}`,
        { signal: controller.signal },
      ),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(githubUsername)}/repos?sort=updated&per_page=6`,
        { signal: controller.signal },
      ),
    ])
      .then(async ([userResponse, reposResponse]) => {
        if (!userResponse.ok || !reposResponse.ok)
          throw new Error(
            userResponse.status === 404
              ? "GitHub profile was not found."
              : "GitHub data is temporarily unavailable.",
          );
        const [githubUser, repos] = await Promise.all([
          userResponse.json(),
          reposResponse.json(),
        ]);
        setGithub({
          loading: false,
          error: "",
          user: githubUser,
          repos: Array.isArray(repos) ? repos : [],
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError")
          setGithub({
            loading: false,
            error: error.message || "Could not load GitHub data.",
            user: null,
            repos: [],
          });
      });
    return () => controller.abort();
  }, [githubUsername]);

  const update = (name, value) =>
    setForm((current) => ({ ...current, [name]: value }));
  const openEditor = () => {
    setForm(initialForm(user));
    setEditing(true);
    setDiscardConfirm(false);
  };

  useEffect(() => {
    if (!editing) return;

    const timer = window.setTimeout(() => {
      editorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [editing]);

  const hasUnsavedChanges =
    JSON.stringify(form) !== JSON.stringify(initialForm(user));

  const requestCancel = () => {
    if (saving) return;
    if (hasUnsavedChanges) {
      setDiscardConfirm(true);
      return;
    }
    setForm(initialForm(user));
    setEditing(false);
  };

  const discardChanges = () => {
    setForm(initialForm(user));
    setEditing(false);
    setDiscardConfirm(false);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (saving) return;
    for (const key of ["githubUrl", "linkedinUrl", "portfolioUrl"]) {
      const value = form[key].trim();
      if (value && !safeLink(value)) {
        toast.error(
          `Enter a valid ${key === "githubUrl" ? "GitHub" : key === "linkedinUrl" ? "LinkedIn" : "portfolio"} URL.`,
        );
        return;
      }
    }
    if (form.githubUrl.trim() && !getGithubUsername(form.githubUrl)) {
      toast.error("Please enter a valid github.com profile URL.");
      return;
    }
    const skillsArray = [
      ...new Set(
        form.skillsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ];
    if (
      skillsArray.length > 100 ||
      skillsArray.some((item) => item.length > 50)
    ) {
      toast.error("Use up to 100 skills, each 50 characters or fewer.");
      return;
    }
    setSaving(true);
    try {
      const response = await updateProfessionalProfile({
        headline: form.headline,
        bio: form.bio,
        location: form.location,
        currentRole: form.currentRole,
        targetRole: form.targetRole,
        linkedinUrl: form.linkedinUrl,
        githubUrl: form.githubUrl,
        portfolioUrl: form.portfolioUrl,
        skills: skillsArray,
      });
      if (!response?.success || !response?.user)
        throw new Error(response?.message || "Profile could not be saved.");
      setUser?.(response.user);
      setEditing(false);
      toast.success("Profile saved");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not save profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await logoutUser();
      setLogoutConfirm(false);
      setUser?.(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Could not log out. Please try again.",
      );
    } finally {
      setLogoutLoading(false);
    }
  };

  const reveal = (delay = 0) =>
    reduceMotion
      ? false
      : { opacity: 0, y: 12, transition: { duration: 0.35, delay } };
  const enter = (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, delay, ease },
  });

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#17191C] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_45%_at_85%_0%,rgba(255,255,255,0.045),transparent_70%)]"
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
          <div className="mx-auto w-full max-w-[1600px] px-4 pb-28 pt-[88px] sm:px-7 sm:pb-12 lg:px-9 lg:pt-9">
            <motion.header
              initial={reveal()}
              animate={enter()}
              className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"
            >
              <div className="max-w-4xl">
                <PageEyebrow className="mb-3">Profile</PageEyebrow>
                <h1 className="text-[36px] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-[48px] lg:text-[55px]">
                  Your professional identity,
                  <span className="block font-serif font-normal italic tracking-[-0.05em] text-[#A1A1AA]">
                    beautifully connected.
                  </span>
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#92949B]">
                  One permanent career profile for your skills, work and
                  developer footprint. Your resumes stay independent until you
                  choose to import them.
                </p>
              </div>
              <div className="hidden flex-wrap items-center justify-end gap-2 md:flex">
                {!editing && (
                  <motion.button
                    type="button"
                    onClick={openEditor}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-xs font-semibold text-[#17191C] shadow-[0_10px_30px_rgba(255,255,255,0.07)]"
                  >
                    <FiEdit3 /> Edit profile <FiArrowUpRight />
                  </motion.button>
                )}
              </div>
            </motion.header>

            <AnimatePresence initial={false}>
              {editing && (
                <motion.section
                  ref={editorRef}
                  key="inline-editor"
                  initial={
                    reduceMotion ? false : { opacity: 0, height: 0, y: -8 }
                  }
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ duration: 0.32, ease }}
                  className="mb-7 scroll-mt-24 overflow-hidden"
                >
                  <Panel>
                    <div className="flex flex-col gap-3 border-b border-white/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/40">
                          Edit your details
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                          Make your profile yours
                          <span className="font-serif italic text-white/50">
                            .
                          </span>
                        </h2>
                        <p className="mt-2 text-xs leading-5 text-white/45">
                          Saved details belong to your RIO profile; resume
                          versions will not be changed.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={requestCancel}
                        aria-label="Close profile form"
                        className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-white/60 hover:bg-white/[0.06] sm:static"
                      >
                        <FiX />
                      </button>
                    </div>
                    <form id="rio-profile-edit-form" onSubmit={saveProfile}>
                      <div className="grid gap-x-5 gap-y-4 p-5 sm:grid-cols-2 sm:p-7">
                        {formFields.map((field) => (
                          <label key={field.name} className="block">
                            <span className="mb-2 block text-xs font-medium text-white/65">
                              {field.label}
                            </span>
                            <input
                              value={form[field.name]}
                              onChange={(event) =>
                                update(field.name, event.target.value)
                              }
                              maxLength={field.maxLength}
                              placeholder={field.placeholder}
                              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30 focus:bg-white/[0.055]"
                            />
                          </label>
                        ))}
                        <label className="block sm:col-span-2">
                          <span className="mb-2 block text-xs font-medium text-white/65">
                            About you
                          </span>
                          <textarea
                            value={form.bio}
                            onChange={(event) =>
                              update("bio", event.target.value)
                            }
                            maxLength={1000}
                            rows={4}
                            placeholder="Summarize your strengths, experience and the work you want to do…"
                            className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-white/30"
                          />
                          <span className="mt-1 block text-right text-[10px] text-white/35">
                            {form.bio.length}/1000
                          </span>
                        </label>
                        <label className="block sm:col-span-2">
                          <span className="mb-2 block text-xs font-medium text-white/65">
                            Skills{" "}
                            <span className="font-normal text-white/35">
                              · comma separated
                            </span>
                          </span>
                          <textarea
                            value={form.skillsText}
                            onChange={(event) =>
                              update("skillsText", event.target.value)
                            }
                            rows={3}
                            placeholder="JavaScript, React, Node.js, C++, SQL…"
                            className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-white/30"
                          />
                          <span className="mt-1 block text-[10px] text-white/35">
                            Up to 100 skills; each can contain up to 50
                            characters.
                          </span>
                        </label>
                      </div>
                      <div className="hidden flex-col-reverse gap-3 border-t border-white/[0.08] bg-white/[0.015] p-5 sm:flex-row sm:justify-end sm:px-7 md:flex">
                        <IconButton
                          onClick={requestCancel}
                          disabled={saving}
                          className="min-h-11"
                        >
                          Cancel
                        </IconButton>
                        <motion.button
                          type="submit"
                          disabled={saving}
                          whileHover={reduceMotion ? undefined : { y: -1 }}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-xs font-semibold text-[#17191C] disabled:opacity-50"
                        >
                          <FiSave />
                          {saving ? "Saving…" : "Save profile"}
                        </motion.button>
                      </div>
                    </form>
                  </Panel>
                </motion.section>
              )}
            </AnimatePresence>

            <motion.section
              initial={reveal(0.04)}
              animate={enter(0.04)}
              className="mb-5"
            >
              <Panel>
                <div className="h-[2px] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                <div className="flex flex-col items-center gap-5 p-5 text-center sm:p-7 lg:flex-row lg:items-start lg:gap-7 lg:p-8 lg:text-left">
                  <div className="flex h-[82px] w-[82px] items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.055] text-xl font-semibold tracking-tight shadow-[0_12px_35px_rgba(0,0,0,0.2)]">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt=""
                        className="h-full w-full rounded-[24px] object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col items-center lg:items-start">
                    <h2 className="text-2xl font-semibold tracking-[-0.04em] sm:text-[30px]">
                      {user?.name || "Your name"}
                    </h2>
                    <span className="mt-2 rounded-full border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.14em] text-white/45">
                      RIO member
                    </span>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                      {user?.headline ||
                        "Your next opportunity starts with a clear introduction."}
                    </p>
                    {user?.location && (
                      <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/45">
                        <FiMapPin />
                        {user.location}
                      </span>
                    )}
                    {user?.email && (
                      <span className="mt-2 break-all text-xs text-white/45">
                        {user.email}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                    {githubProfileUrl && (
                      <a
                        href={githubProfileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3.5 text-xs font-semibold text-white/75 hover:bg-white/[0.075]"
                      >
                        <FiGithub /> GitHub <FiExternalLink />
                      </a>
                    )}
                    {linkedinUrl && (
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3.5 text-xs font-semibold text-white/75 hover:bg-white/[0.075]"
                      >
                        <FiLinkedin /> LinkedIn <FiExternalLink />
                      </a>
                    )}
                    {portfolioUrl && (
                      <a
                        href={portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3.5 text-xs font-semibold text-white/75 hover:bg-white/[0.075]"
                      >
                        <FiGlobe /> Portfolio <FiExternalLink />
                      </a>
                    )}
                  </div>
                  {user?.bio && (
                    <p className="w-full max-w-3xl border-t border-white/[0.08] pt-5 text-sm leading-7 text-white/60 lg:ml-auto lg:max-w-xs lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                      {user.bio}
                    </p>
                  )}
                </div>
              </Panel>
            </motion.section>

            <section
              aria-label="Career summary"
              className="mb-7 grid gap-3 sm:grid-cols-3"
            >
              {[
                {
                  label: "Target role",
                  value: user?.targetRole || "Not set",
                  detail: "Your next career milestone",
                  icon: FiTarget,
                },
                {
                  label: "Current role",
                  value: user?.currentRole || "Not set",
                  detail: "Your professional status",
                  icon: FiBriefcase,
                },
                {
                  label: "Skills listed",
                  value: String(skills.length),
                  detail: "In your permanent profile",
                  icon: FiCode,
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={reveal(0.08 + index * 0.04)}
                    animate={enter(0.08 + index * 0.04)}
                    whileHover={reduceMotion ? undefined : { y: -3 }}
                  >
                    <Panel className="h-full p-5">
                      <div className="flex items-center justify-between text-xs text-white/45">
                        <span>{item.label}</span>
                        <Icon size={16} />
                      </div>
                      <p className="mt-4 truncate text-[23px] font-semibold tracking-tight">
                        {item.value}
                      </p>
                      <p className="mt-1 text-[11px] text-white/40">
                        {item.detail}
                      </p>
                    </Panel>
                  </motion.div>
                );
              })}
            </section>

            <div className="mb-7 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
              <Panel className="p-5 sm:p-6 lg:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">
                      Developer footprint
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      GitHub activity
                    </h2>
                    <p className="mt-2 text-xs leading-5 text-white/45">
                      Public repositories and profile details, loaded from
                      GitHub.
                    </p>
                  </div>
                  <FiGithub size={22} className="text-white/55" />
                </div>
                {!githubUsername ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-5">
                    <p className="text-sm font-medium">
                      Connect your GitHub profile
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/45">
                      Add your GitHub URL in Edit profile to show public
                      repository details here.
                    </p>
                    <button
                      type="button"
                      onClick={openEditor}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white"
                    >
                      Add GitHub <FiArrowUpRight />
                    </button>
                  </div>
                ) : github.loading ? (
                  <div className="mt-6 space-y-3">
                    <div className="h-20 animate-pulse rounded-2xl bg-white/[0.04]" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
                      <div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
                      <div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
                    </div>
                  </div>
                ) : github.error ? (
                  <div className="mt-6 rounded-2xl border border-white/10 p-4">
                    <p className="text-sm text-white/70">{github.error}</p>
                    <a
                      href={githubProfileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-white/70"
                    >
                      Open GitHub <FiExternalLink />
                    </a>
                  </div>
                ) : (
                  <>
                    <a
                      href={github.user?.html_url || githubProfileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:bg-white/[0.05]"
                    >
                      {github.user?.avatar_url ? (
                        <img
                          src={github.user.avatar_url}
                          alt=""
                          className="h-12 w-12 rounded-full border border-white/10"
                        />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10">
                          <FiGithub />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {github.user?.name ||
                            github.user?.login ||
                            githubUsername}
                        </span>
                        <span className="mt-1 block truncate text-xs text-white/45">
                          {github.user?.bio ||
                            `@${github.user?.login || githubUsername}`}
                        </span>
                      </span>
                      <FiExternalLink className="shrink-0 text-white/45" />
                    </a>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        {
                          label: "Repositories",
                          value: github.user?.public_repos ?? "—",
                          icon: FiGitBranch,
                        },
                        {
                          label: "Followers",
                          value: github.user?.followers ?? "—",
                          icon: FiUsers,
                        },
                        {
                          label: "Following",
                          value: github.user?.following ?? "—",
                          icon: FiUser,
                        },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.label}
                            className="rounded-xl border border-white/[0.08] p-3"
                          >
                            <Icon className="text-white/40" size={14} />
                            <p className="mt-2 text-lg font-semibold">
                              {item.value}
                            </p>
                            <p className="text-[10px] text-white/40">
                              {item.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold">
                        Recently updated repositories
                      </h3>
                      <a
                        href={`${githubProfileUrl.replace(/\/$/, "")}?tab=repositories`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-white/50 hover:text-white"
                      >
                        All repositories ↗
                      </a>
                    </div>
                    {github.repos.length ? (
                      <div className="mt-3 divide-y divide-white/[0.07]">
                        {github.repos.slice(0, 5).map((repo) => (
                          <a
                            key={repo.id}
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-start gap-3 py-3 transition hover:bg-white/[0.02]"
                          >
                            <span className="mt-0.5 text-white/35">
                              <FiGitBranch size={15} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-semibold text-white/85">
                                {repo.name}
                              </span>
                              <span className="mt-1 line-clamp-2 block text-[10px] leading-4 text-white/40">
                                {repo.description || "Public repository"}
                              </span>
                              <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/40">
                                {repo.language && <span>{repo.language}</span>}
                                <span className="inline-flex items-center gap-1">
                                  <FiStar /> {repo.stargazers_count}
                                </span>
                                <span>
                                  Updated {formatDate(repo.updated_at)}
                                </span>
                              </span>
                            </span>
                            <FiExternalLink
                              className="mt-1 shrink-0 text-white/35"
                              size={13}
                            />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-white/45">
                        No public repositories were returned by GitHub.
                      </p>
                    )}
                  </>
                )}
                <div className="mt-4 flex justify-center border-t border-white/[0.08] pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!githubUsername) {
                        openEditor();
                        return;
                      }
                      setGithub((current) => ({
                        ...current,
                        loading: true,
                        error: "",
                      }));
                      Promise.all([
                        fetch(
                          `https://api.github.com/users/${encodeURIComponent(githubUsername)}`,
                        ),
                        fetch(
                          `https://api.github.com/users/${encodeURIComponent(githubUsername)}/repos?sort=updated&per_page=6`,
                        ),
                      ])
                        .then(async ([userResponse, reposResponse]) => {
                          if (!userResponse.ok || !reposResponse.ok)
                            throw new Error("Could not refresh GitHub data.");
                          const [ghUser, repos] = await Promise.all([
                            userResponse.json(),
                            reposResponse.json(),
                          ]);
                          setGithub({
                            loading: false,
                            error: "",
                            user: ghUser,
                            repos: Array.isArray(repos) ? repos : [],
                          });
                        })
                        .catch((err) => {
                          setGithub((current) => ({
                            ...current,
                            loading: false,
                            error: err.message,
                          }));
                          toast.error(err.message);
                        });
                    }}
                    className="inline-flex items-center justify-center gap-2 text-xs font-medium text-white/55 hover:text-white"
                  >
                    <FiRefreshCw size={13} /> Refresh GitHub data
                  </button>
                </div>
              </Panel>

              <div className="flex flex-col gap-5">
                <Panel className="p-5 sm:p-6">
                  <div className="flex flex-col items-center text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.035]">
                      <FiCode />
                    </span>
                    <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">
                      Coding profile
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      LeetCode
                    </h2>
                  </div>
                  <p className="mt-3 text-center text-xs leading-6 text-white/50">
                    Keep your coding practice identity connected to your
                    professional profile.
                  </p>
                  {user?.leetcodeUrl ? (
                    <a
                      href={safeLink(user.leetcodeUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3 hover:bg-white/[0.05]"
                    >
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold">
                          LeetCode profile
                        </span>
                        <span className="mt-1 block truncate text-[10px] text-white/45">
                          {user.leetcodeUrl}
                        </span>
                      </span>
                      <FiExternalLink />
                    </a>
                  ) : (
                    <p className="mt-4 rounded-xl border border-dashed border-white/15 p-4 text-xs leading-5 text-white/45">
                      LeetCode stats are not connected yet. Add your profile
                      link in the Resume Builder or connect it in a future
                      profile-field update.
                    </p>
                  )}
                  <div className="mt-4 flex justify-center">
                    <a
                      href={
                        safeLink(user?.leetcodeUrl) || "https://leetcode.com/"
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-[#17191C]"
                    >
                      {user?.leetcodeUrl ? "Open profile" : "Open LeetCode"}{" "}
                      <FiArrowUpRight />
                    </a>
                  </div>
                </Panel>
                <Panel className="p-5 sm:p-6">
                  <div className="text-center">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">
                      Professional links
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      Across your career
                    </h2>
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      {
                        label: "LinkedIn",
                        value: user?.linkedinUrl,
                        icon: FiLinkedin,
                      },
                      {
                        label: "Portfolio",
                        value: user?.portfolioUrl,
                        icon: FiGlobe,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      const href = safeLink(item.value);
                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 rounded-xl border border-white/[0.08] p-3"
                        >
                          <Icon className="shrink-0 text-white/45" size={16} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-white/40">
                              {item.label}
                            </p>
                            {href ? (
                              <a
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 block truncate text-xs text-white/80 hover:text-white"
                              >
                                {item.value}
                              </a>
                            ) : (
                              <p className="mt-1 text-xs text-white/45">
                                Not connected
                              </p>
                            )}
                          </div>
                          {href && (
                            <FiExternalLink
                              className="text-white/35"
                              size={13}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              </div>
            </div>

            <div className="mb-7 grid gap-5 lg:grid-cols-2">
              <Panel className="p-5 sm:p-6 lg:p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035]">
                    <FiBookOpen />
                  </span>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">
                      Career history
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">Education</h2>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-6 text-white/45">
                  Your education entries will appear here when the profile
                  schema supports structured education records. For now, use
                  Edit profile for your core career details.
                </p>
              </Panel>
              <Panel className="p-5 sm:p-6 lg:p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035]">
                    <FiBriefcase />
                  </span>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">
                      Career history
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">
                      Experience & projects
                    </h2>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-6 text-white/45">
                  Resume-specific experience and project details stay with each
                  resume until you explicitly import them into the permanent
                  profile.
                </p>
              </Panel>
            </div>

            <Panel className="p-5 sm:p-6 lg:p-7">
              <div
                id="profile-skills"
                className="flex scroll-mt-24 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    Skill inventory
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Your skills, at a glance.
                  </h2>
                  <p className="mt-2 text-xs text-white/45">
                    A focused snapshot of the strengths you want employers to
                    notice.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openEditor}
                  className="inline-flex items-center gap-2 self-start text-xs font-semibold text-white/60 hover:text-white"
                >
                  Manage skills <FiEdit3 />
                </button>
              </div>
              {skills.length ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <motion.span
                      key={skill}
                      whileHover={reduceMotion ? undefined : { y: -2 }}
                      className="rounded-full border border-white/[0.10] bg-white/[0.035] px-3.5 py-2 text-xs text-white/75"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <div className="mt-5 flex flex-col items-start gap-3 border-t border-white/[0.08] pt-5">
                  <p className="text-sm text-white/60">
                    Your skill inventory is ready to build.
                  </p>
                  <p className="max-w-xl text-xs leading-5 text-white/40">
                    Add your strongest technologies, tools and foundations.
                    These remain in your profile until you change them.
                  </p>
                  <button
                    type="button"
                    onClick={openEditor}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white"
                  >
                    Add your first skills <FiArrowUpRight />
                  </button>
                </div>
              )}
            </Panel>
            <footer className="mt-8 flex flex-col gap-2 border-t border-white/[0.08] pt-5 text-[10px] leading-5 text-white/35 sm:flex-row sm:items-center sm:justify-between">
              <span>RIO Career Intelligence · Your profile, your control.</span>
              <span>
                Public GitHub data is provided by GitHub; LeetCode statistics
                are not fetched here.
              </span>
            </footer>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {discardConfirm && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="discard-title"
              initial={
                reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease }}
              className="w-full max-w-md rounded-[22px] border border-white/10 bg-[#111315] p-5 shadow-2xl sm:p-6"
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Unsaved changes
              </p>
              <h2 id="discard-title" className="mt-2 text-xl font-semibold">
                Discard your edits?
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Your changes have not been saved. If you discard them, your
                profile will keep its previous saved values.
              </p>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDiscardConfirm(false)}
                  className="min-h-10 rounded-full border border-white/10 px-4 text-xs font-semibold text-white/75 hover:bg-white/[0.05]"
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  onClick={discardChanges}
                  className="min-h-10 rounded-full bg-white px-4 text-xs font-semibold text-[#17191C]"
                >
                  Discard changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#111315]/92 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex w-full max-w-md flex-row items-center justify-center gap-2">
          {!editing ? (
            <>
              <button
                type="button"
                onClick={openEditor}
                className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-white px-2 sm:px-4 text-xs font-semibold text-[#17191C] shadow-[0_-10px_35px_rgba(0,0,0,0.22)] transition hover:bg-[#E8E8EB] active:scale-[0.99]"
              >
                <FiEdit3 size={14} />
                Edit profile
              </button>

              <button
                type="button"
                onClick={() => setLogoutConfirm(true)}
                className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-2 sm:px-4 text-xs font-semibold text-white/80 transition hover:bg-white/[0.09] active:scale-[0.99]"
              >
                <FiArrowUpRight size={14} />
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={requestCancel}
                disabled={saving}
                className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-2 sm:px-3 text-xs font-semibold text-white/75 disabled:opacity-50"
              >
                <FiX size={14} />
                Cancel
              </button>

              <button
                type="submit"
                form="rio-profile-edit-form"
                disabled={saving}
                className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-white px-2 sm:px-3 text-xs font-semibold text-[#17191C] disabled:opacity-50"
              >
                <FiSave size={14} />
                {saving ? "Saving…" : "Save changes"}
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={logoutConfirm}
        onClose={() => !logoutLoading && setLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Log out of RIO?"
        description="You can sign back in anytime to continue your career workspace."
        confirmLabel="Log out"
        loading={logoutLoading}
      />
    </div>
  );
}
