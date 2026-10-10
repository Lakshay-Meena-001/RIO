import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiCheck,
  FiClock,
  FiCode,
  FiFileText,
  FiLayers,
  FiMenu,
  FiPlay,
  FiTarget,
  FiUser,
  FiX,
} from "react-icons/fi";

import Sidebar from "../components/SideBar";
import { startInterview, getActiveInterview } from "../api/interview.api";

const CustomSelect = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <label className="mb-2 block text-xs text-[#A1A1AA]">{label}</label>

      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm outline-none transition-all ${
          open
            ? "border-white/25 bg-white/[0.075]"
            : "border-white/10 bg-white/[0.045] hover:border-white/15 hover:bg-white/[0.055]"
        }`}
      >
        <span className="text-white">{selectedOption?.label}</span>

        <svg
          viewBox="0 0 20 20"
          fill="none"
          className={`h-4 w-4 text-[#71717A] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-full overflow-hidden rounded-xl border border-white/[0.12] bg-[#1B1D20] p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <div className="max-h-56 overflow-y-auto">
            {options.map((option) => {
              const selected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    selected
                      ? "bg-white/[0.09] text-white"
                      : "text-[#A1A1AA] hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <span>{option.label}</span>

                  {selected && (
                    <FiCheck size={14} className="shrink-0 text-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const NewInterview = ({ user, setUser }) => {
  const navigate = useNavigate();

  const CODING_QUESTION_RULES = {
    easy: {
      averageTime: 9,
      maximum: 9,
    },
    medium: {
      averageTime: 30,
      maximum: 6,
    },
    hard: {
      averageTime: 45,
      maximum: 3,
    },
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const [checkingActiveInterview, setCheckingActiveInterview] = useState(true);
  const [activeInterview, setActiveInterview] = useState(null);

  /*
   * ---------------------------------------------------------
   * Interview configuration
   * ---------------------------------------------------------
   */

  const [form, setForm] = useState({
    role: "",
    experienceLevel: "fresher",
    interviewLevel: "fresher",
    interviewType: "full",
    subjects: [],
    techStack: [],
    projectContext: {
      source: "description",
      projectName: "",
      description: "",
      githubUrl: "",
    },
    difficulty: "adaptive",
    timeLimit: 30,
    questionCount: 10,
    language: "english",
    codingLanguage: "cpp",
  });

  const [techStackInput, setTechStackInput] = useState("");

  const getCodingQuestionLimit = (difficulty, timeLimit) => {
    const rule = CODING_QUESTION_RULES[difficulty];

    if (!rule) {
      return 1;
    }

    return Math.max(
      1,
      Math.min(rule.maximum, Math.floor(Number(timeLimit) / rule.averageTime)),
    );
  };

  const codingMaxQuestions = getCodingQuestionLimit(
    form.difficulty,
    form.timeLimit,
  );

  /*
   * ---------------------------------------------------------
   * Generic field update
   * ---------------------------------------------------------
   */

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  };

  /*
   * ---------------------------------------------------------
   * Project context update
   * ---------------------------------------------------------
   */

  const updateProjectContext = (field, value) => {
    setForm((previous) => ({
      ...previous,
      projectContext: {
        ...previous.projectContext,
        [field]: value,
      },
    }));

    setError("");
  };

  /*
   * ---------------------------------------------------------
   * Core subject toggle
   * ---------------------------------------------------------
   */

  const toggleSubject = (subject) => {
    setForm((previous) => {
      const exists = previous.subjects.includes(subject);

      return {
        ...previous,
        subjects: exists
          ? previous.subjects.filter((item) => item !== subject)
          : [...previous.subjects, subject],
      };
    });

    setError("");
  };

  /*
   * ---------------------------------------------------------
   * Tech stack
   * ---------------------------------------------------------
   */

  const addTechStack = () => {
    const value = techStackInput.trim();

    if (!value) return;

    setForm((previous) => {
      if (previous.techStack.includes(value)) {
        return previous;
      }

      return {
        ...previous,
        techStack: [...previous.techStack, value],
      };
    });

    setTechStackInput("");
    setError("");
  };

  const removeTechStack = (technology) => {
    setForm((previous) => ({
      ...previous,
      techStack: previous.techStack.filter((item) => item !== technology),
    }));
  };

  /*
   * ---------------------------------------------------------
   * Validation
   * ---------------------------------------------------------
   */

  const validateForm = () => {
    if (form.interviewType === "coding" && !form.codingLanguage) {
      return "Select a programming language for the coding interview.";
    }
    if (!form.role.trim()) {
      return "Please enter the role you want to practice for.";
    }

    if (form.interviewType === "core" && form.subjects.length === 0) {
      return "Select at least one Core CS subject.";
    }

    if (form.interviewType === "development" && form.techStack.length === 0) {
      return "Add at least one technology for the development interview.";
    }

    if (form.interviewType === "project") {
      if (!form.projectContext.projectName.trim()) {
        return "Please enter your project name.";
      }

      if (!form.projectContext.description.trim()) {
        return "Please describe your project.";
      }
    }

    return null;
  };

  /*
   * ---------------------------------------------------------
   * Start interview
   * ---------------------------------------------------------
   */

  const handleStartInterview = async () => {
    if (checkingActiveInterview) {
      return;
    }

    if (activeInterview?._id) {
      navigate(`/mock-interview/${activeInterview._id}`);
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setStarting(true);
      setError("");

      const payload = {
        role: form.role.trim(),
        experienceLevel: form.experienceLevel,
        interviewLevel: form.interviewLevel,
        interviewType: form.interviewType,
        subjects: form.subjects,
        techStack: form.techStack,
        projectContext:
          form.interviewType === "project" || form.interviewType === "full"
            ? {
                ...form.projectContext,
                projectName: form.projectContext.projectName.trim(),
                description: form.projectContext.description.trim(),
                githubUrl: form.projectContext.githubUrl.trim(),
              }
            : undefined,
        difficulty: form.difficulty,
        timeLimit: Number(form.timeLimit),
        questionCount: Number(form.questionCount),
        language: form.language,
        codingLanguage:
          form.interviewType === "coding" ? form.codingLanguage : null,
      };

      const result = await startInterview(payload);

      if (!result?.success || !result?.data?.interviewId) {
        throw new Error(result?.message || "Unable to start the interview.");
      }

      navigate(`/mock-interview/${result.data.interviewId}`);
    } catch (err) {
      console.error("Failed to start interview:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to start the interview. Please try again.",
      );
    } finally {
      setStarting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Shared styles
   * ---------------------------------------------------------
   */

  const inputClass =
    "w-full rounded-[13px] border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-[#52525B] hover:border-white/[0.14] focus:border-white/[0.22] focus:bg-white/[0.06]";

  const optionClass = (active) =>
    `cursor-pointer rounded-[13px] border px-4 py-3 transition-all duration-200 ${
      active
        ? "border-white/[0.20] bg-white/[0.085] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        : "border-white/[0.09] bg-white/[0.028] text-[#A1A1AA] hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white"
    }`;

  useEffect(() => {
    let cancelled = false;

    const checkActiveInterview = async () => {
      try {
        const result = await getActiveInterview();

        if (cancelled) return;

        if (!result?.success) {
          throw new Error(
            result?.message || "Failed to check active interview.",
          );
        }

        const active = result.data || null;

        setActiveInterview(active);

        if (active?._id) {
          navigate(`/mock-interview/${active._id}`, {
            replace: true,
          });
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to check active interview:", err);
        setActiveInterview(null);
      } finally {
        if (!cancelled) {
          setCheckingActiveInterview(false);
        }
      }
    };

    checkActiveInterview();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#17191C] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 85% 65% at 100% 0%,
                rgba(255,255,255,0.065) 0%,
                rgba(255,255,255,0.022) 36%,
                transparent 72%
              ),
              radial-gradient(
                ellipse 75% 60% at 0% 100%,
                rgba(255,255,255,0.025) 0%,
                transparent 70%
              ),
              linear-gradient(
                115deg,
                #191b1e 0%,
                #17191c 45%,
                #181a1d 72%,
                #1b1e21 100%
              )
            `,
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Mobile top bar */}
        <header className="fixed left-3 right-3 top-3 z-40 mx-3 flex h-14 items-center justify-between rounded-full border border-white/[0.12] bg-[#17191C]/60 px-3 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-2xl md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/[0.1]"
            aria-label="Open navigation"
          >
            <FiMenu size={18} />
          </button>

          <span
            className="text-[17px] tracking-tight text-white"
            style={{ fontFamily: '"Zen Dots", sans-serif' }}
          >
            RIO
          </span>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </header>

        <div className="flex min-h-screen">
          <Sidebar
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            user={user}
            sidebarOpen={sidebarOpen}
            setUser={setUser}
            setSidebarOpen={setSidebarOpen}
          />

          <main
            className={`min-w-0 flex-1 transition-[margin-left] duration-300 ${
              sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"
            }`}
          >
            <div className="mx-auto w-full max-w-[1400px] px-4 pb-32 pt-[86px] sm:px-6 lg:px-8 lg:py-8 lg:pb-12">
              {/* Header */}
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => navigate("/mock-interview")}
                  className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-[#A1A1AA] transition-colors hover:text-white"
                >
                  <FiArrowLeft size={14} />
                  Back to interviews
                </button>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#777A82]">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/75" />
                      Interview configuration
                    </p>

                    <h1 className="text-[32px] font-semibold leading-[1] tracking-[-0.05em] sm:text-[44px]">
                      Build the interview
                      <br />
                      <span
                        className="font-serif font-normal italic text-[#B9BAC0]"
                        style={{
                          fontFamily: 'Georgia, "Times New Roman", serif',
                        }}
                      >
                        you want to practice.
                      </span>
                    </h1>

                    <p className="mt-4 max-w-2xl text-sm leading-6 text-[#9699A1] sm:text-[15px]">
                      Shape the role, depth and format before you step into the
                      room. RIO will use this setup to create a focused mock
                      interview around your goals.
                    </p>
                  </div>

                  <div className="hidden items-center gap-3 rounded-[17px] border border-white/[0.11] bg-[#ffffff] px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.16)] lg:flex">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/20 bg-black/[0.05]">
                      <span className="text-xl  text-[#17191C] font-semibold">
                        ₹
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#6F727A]">
                        Practice session
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-[#17191C]">
                        100 INR
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-[16px] border border-white/[0.11] bg-[#17191C] px-4 py-3 text-sm text-[#D4D4D8] shadow-[0_12px_35px_rgba(0,0,0,0.14)]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F2A97B]" />
                  <p>{error}</p>
                </div>
              )}

              <div className="overflow-hidden rounded-[22px] border border-white/[0.12] bg-[#111315] shadow-[0_26px_75px_rgba(0,0,0,0.22)]">
                {/* Basic configuration */}
                <section className="relative overflow-hidden border-b border-white/[0.08] p-5 sm:p-7">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-[#A1A1AA] sm:flex">
                      <FiUser size={17} />
                    </div>

                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#6F727A]">
                        01 · Profile
                      </p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                        Start with the role.
                      </h2>
                      <p className="mt-1.5 text-xs leading-5 text-[#777A82]">
                        Tell the interviewer who you are preparing to become.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-[#A1A1AA]">
                        Role
                      </label>

                      <input
                        type="text"
                        value={form.role}
                        onChange={(event) =>
                          updateField("role", event.target.value)
                        }
                        placeholder="e.g. Software Engineer"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-[#A1A1AA]">
                        Experience
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ["fresher", "Fresher"],
                          ["experienced", "Experienced"],
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              updateField("experienceLevel", value)
                            }
                            className={optionClass(
                              form.experienceLevel === value,
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-xs font-medium text-[#A1A1AA]">
                      Interview level
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        ["fresher", "Fresher"],
                        ["sde-1", "SDE-1"],
                        ["sde-2", "SDE-2"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateField("interviewLevel", value)}
                          className={optionClass(form.interviewLevel === value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Interview type */}
                <section className="border-b border-white/[0.08] p-5 sm:p-7">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-[#A1A1AA] sm:flex">
                      <FiLayers size={17} />
                    </div>

                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#6F727A]">
                        02 · Format
                      </p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                        Choose the conversation.
                      </h2>
                      <p className="mt-1.5 text-xs leading-5 text-[#777A82]">
                        Pick the kind of pressure you want to practice today.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      ["coding", "Coding", FiCode],
                      ["core", "Core CS", FiBookOpen],
                      ["development", "Development", FiBriefcase],
                      ["project", "Project", FiFileText],
                      ["system-design", "System Design", FiLayers],
                      ["behavioral", "Behavioral", FiUser],
                      ["full", "Full Interview", FiTarget],
                    ].map(([value, label, Icon]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          if (value === "coding") {
                            setForm((previous) => ({
                              ...previous,
                              interviewType: "coding",
                              difficulty: "easy",
                              questionCount: getCodingQuestionLimit(
                                "easy",
                                previous.timeLimit,
                              ),
                            }));
                          } else {
                            setForm((previous) => ({
                              ...previous,
                              interviewType: value,
                            }));
                          }

                          setError("");
                        }}
                        className={`flex items-center gap-3 rounded-[13px] border px-4 py-3 text-left transition-all duration-200 ${
                          form.interviewType === value
                            ? "border-white/[0.20] bg-white/[0.085] text-white"
                            : "border-white/10 bg-white/[0.035] text-[#A1A1AA] hover:bg-white/[0.055]"
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-xs font-medium">{label}</span>

                        {form.interviewType === value && (
                          <FiCheck size={14} className="ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Coding language */}
                {form.interviewType === "coding" && (
                  <section className="border-b border-white/[0.08] p-5 sm:p-7">
                    <div className="mb-5">
                      <p className="text-xs font-medium text-[#A1A1AA]">
                        Programming language
                      </p>

                      <p className="mt-1 text-[11px] text-[#71717A]">
                        Choose the language you will use to solve the coding
                        problems.
                      </p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                      {[
                        ["cpp", "C++"],
                        ["python", "Python"],
                        ["javascript", "JavaScript"],
                        ["typescript", "TypeScript"],
                        ["java", "Java"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateField("codingLanguage", value)}
                          className={optionClass(form.codingLanguage === value)}
                        >
                          <span>{label}</span>

                          {form.codingLanguage === value && (
                            <FiCheck size={14} className="ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Core subjects */}
                {form.interviewType === "core" && (
                  <section className="border-b border-white/[0.08] p-5 sm:p-7">
                    <p className="mb-4 text-xs font-medium text-[#A1A1AA]">
                      Select Core CS subjects
                    </p>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                      {["dbms", "os", "cn", "sql", "oop"].map((subject) => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          className={optionClass(
                            form.subjects.includes(subject),
                          )}
                        >
                          {subject.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Development stack */}
                {form.interviewType === "development" && (
                  <section className="border-b border-white/[0.08] p-5 sm:p-7">
                    <p className="mb-2 text-xs font-medium text-[#A1A1AA]">
                      Technology stack
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={techStackInput}
                        onChange={(event) =>
                          setTechStackInput(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addTechStack();
                          }
                        }}
                        placeholder="e.g. React, Node.js, MongoDB"
                        className={inputClass}
                      />

                      <button
                        type="button"
                        onClick={addTechStack}
                        className="shrink-0 rounded-xl border border-white/10 bg-white/[0.07] px-4 text-xs font-semibold text-white hover:bg-white/[0.1]"
                      >
                        Add
                      </button>
                    </div>

                    {form.techStack.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {form.techStack.map((technology) => (
                          <span
                            key={technology}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-[#D4D4D8]"
                          >
                            {technology}

                            <button
                              type="button"
                              onClick={() => removeTechStack(technology)}
                              className="text-[#71717A] hover:text-white"
                              aria-label={`Remove ${technology}`}
                            >
                              <FiX size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* Project context */}
                {(form.interviewType === "project" ||
                  form.interviewType === "full") && (
                  <section className="border-b border-white/[0.08] p-5 sm:p-7">
                    <div className="mb-5">
                      <p className="text-xs font-medium text-[#A1A1AA]">
                        Project context
                      </p>
                      <p className="mt-1 text-[11px] text-[#71717A]">
                        Give the interviewer enough context to ask meaningful
                        project questions.
                      </p>
                    </div>

                    <div className="grid gap-5">
                      <div>
                        <label className="mb-2 block text-xs text-[#A1A1AA]">
                          Project name
                        </label>

                        <input
                          type="text"
                          value={form.projectContext.projectName}
                          onChange={(event) =>
                            updateProjectContext(
                              "projectName",
                              event.target.value,
                            )
                          }
                          placeholder="e.g. RIO"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs text-[#A1A1AA]">
                          Project description
                        </label>

                        <textarea
                          value={form.projectContext.description}
                          onChange={(event) =>
                            updateProjectContext(
                              "description",
                              event.target.value,
                            )
                          }
                          placeholder="Describe the project, architecture, your contribution and important technical decisions..."
                          rows={5}
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs text-[#A1A1AA]">
                          GitHub URL
                        </label>

                        <input
                          type="url"
                          value={form.projectContext.githubUrl}
                          onChange={(event) =>
                            updateProjectContext(
                              "githubUrl",
                              event.target.value,
                            )
                          }
                          placeholder="https://github.com/..."
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </section>
                )}

                {/* Interview settings */}
                <section className="border-b border-white/[0.08] p-5 sm:p-7">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-[#A1A1AA] sm:flex">
                      <FiTarget size={17} />
                    </div>

                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#6F727A]">
                        03 · Settings
                      </p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                        Set the pressure.
                      </h2>
                      <p className="mt-1.5 text-xs leading-5 text-[#777A82]">
                        Control difficulty, time and how much ground the session
                        covers.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-3">
                    <div>
                      <CustomSelect
                        label="Difficulty"
                        value={form.difficulty}
                        onChange={(value) => {
                          if (form.interviewType === "coding") {
                            setForm((previous) => ({
                              ...previous,
                              difficulty: value,
                              questionCount: getCodingQuestionLimit(
                                value,
                                previous.timeLimit,
                              ),
                            }));
                            setError("");
                            return;
                          }

                          updateField("difficulty", value);
                        }}
                        options={
                          form.interviewType === "coding"
                            ? [
                                { value: "easy", label: "Easy" },
                                { value: "medium", label: "Medium" },
                                { value: "hard", label: "Hard" },
                              ]
                            : [
                                { value: "adaptive", label: "Adaptive" },
                                { value: "easy", label: "Easy" },
                                { value: "medium", label: "Medium" },
                                { value: "hard", label: "Hard" },
                              ]
                        }
                      />
                    </div>

                    <div>
                      <CustomSelect
                        label="Time limit"
                        value={form.timeLimit}
                        onChange={(value) => {
                          const timeLimit = Number(value);

                          if (form.interviewType === "coding") {
                            setForm((previous) => ({
                              ...previous,
                              timeLimit,
                              questionCount: getCodingQuestionLimit(
                                previous.difficulty,
                                timeLimit,
                              ),
                            }));
                            setError("");
                            return;
                          }

                          updateField("timeLimit", timeLimit);
                        }}
                        options={[
                          { value: 15, label: "15 minutes" },
                          { value: 30, label: "30 minutes" },
                          { value: 45, label: "45 minutes" },
                          { value: 60, label: "60 minutes" },
                          { value: 90, label: "90 minutes" },
                        ]}
                      />
                    </div>

                    <div>
                      <CustomSelect
                        label="Questions"
                        value={form.questionCount}
                        onChange={(value) => {
                          const questionCount = Number(value);

                          if (form.interviewType === "coding") {
                            setForm((previous) => ({
                              ...previous,
                              questionCount: Math.min(
                                questionCount,
                                getCodingQuestionLimit(
                                  previous.difficulty,
                                  previous.timeLimit,
                                ),
                              ),
                            }));
                            setError("");
                            return;
                          }

                          updateField("questionCount", questionCount);
                        }}
                        options={
                          form.interviewType === "coding"
                            ? Array.from(
                                { length: codingMaxQuestions },
                                (_, index) => ({
                                  value: index + 1,
                                  label: `${index + 1} ${
                                    index === 0 ? "question" : "questions"
                                  }`,
                                }),
                              )
                            : [
                                { value: 5, label: "5 questions" },
                                { value: 10, label: "10 questions" },
                                { value: 15, label: "15 questions" },
                                { value: 20, label: "20 questions" },
                              ]
                        }
                      />
                    </div>
                  </div>
                </section>

                {/* Cost / CTA desktop */}
                <section className="p-5 sm:p-7">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FiClock size={15} className="text-[#A1A1AA]" />
                        <span className="text-xs text-[#A1A1AA]">
                          {form.timeLimit} minutes
                        </span>

                        <span className="text-white/20">•</span>

                        <span className="text-xs text-[#A1A1AA]">
                          {form.questionCount} questions
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-semibold">100</span>
                        <span className="text-xs text-[#71717A]">
                          per interview
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartInterview}
                      disabled={starting || checkingActiveInterview}
                      className="hidden items-center justify-center gap-2 rounded-[13px] bg-white px-6 py-3.5 text-sm font-semibold text-[#17191C] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(0,0,0,0.24)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
                    >
                      {starting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#52525E] border-t-[#17191C]" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <FiPlay size={15} />
                          {checkingActiveInterview
                            ? "Checking active interview..."
                            : starting
                              ? "Starting..."
                              : "Start Interview"}
                          <FiArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#111315]/95 p-3 backdrop-blur-xl sm:hidden">
        <button
          type="button"
          onClick={handleStartInterview}
          disabled={starting || checkingActiveInterview}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-[#17191C] disabled:opacity-50"
        >
          {starting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#52525E] border-t-[#17191C]" />
              Starting...
            </>
          ) : (
            <>
              <FiPlay size={15} />
              {checkingActiveInterview
                ? "Checking active interview..."
                : starting
                  ? "Starting..."
                  : "Start Interview"}
              <FiArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NewInterview;
