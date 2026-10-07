import { useMemo, useState } from "react";
import {
  FiArrowRight,
  FiBriefcase,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiFileText,
  FiSearch,
  FiSparkles,
  FiTarget,
  FiX,
} from "react-icons/fi";

const POPULAR_ROLES = [
  "Software Engineer",
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "MERN Stack Developer",
  "AI Engineer",
  "ML Engineer",
  "Data Engineer",
];

const ROLE_CATEGORIES = {
  "Software Engineering": [
    "Software Engineer",
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "MERN Stack Developer",
    "Java Developer",
    "Python Developer",
  ],
  "AI & Data": [
    "AI Engineer",
    "ML Engineer",
    "GenAI Engineer",
    "Data Scientist",
    "Data Engineer",
    "MLOps Engineer",
  ],
  "Cloud & DevOps": [
    "Cloud Engineer",
    "DevOps Engineer",
    "Site Reliability Engineer",
    "Platform Engineer",
  ],
  Security: [
    "Cybersecurity Engineer",
    "Security Engineer",
    "Application Security Engineer",
  ],
  Mobile: ["Android Developer", "iOS Developer", "Mobile Developer"],
};

const PACKAGE_OPTIONS = [
  "10 LPA",
  "15 LPA",
  "20 LPA",
  "25 LPA",
  "30 LPA",
  "40 LPA",
  "50 LPA",
  "60 LPA",
  "70 LPA",
  "80 LPA",
  "90 LPA",
  "1 Cr",
  "1 Cr+",
];

const RoadmapGenerator = ({
  onGenerate,
  loading = false,
  error = null,
  resume = null,
}) => {
  const [role, setRole] = useState("");
  const [roleSearchOpen, setRoleSearchOpen] = useState(false);

  const [targetPackage, setTargetPackage] = useState("20 LPA");
  const [customPackage, setCustomPackage] = useState("");

  const [useResume, setUseResume] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [experienceLevel, setExperienceLevel] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("");

  const filteredRoles = useMemo(() => {
    const query = role.trim().toLowerCase();

    if (!query) {
      return POPULAR_ROLES;
    }

    return Object.values(ROLE_CATEGORIES)
      .flat()
      .filter((item) => item.toLowerCase().includes(query))
      .slice(0, 8);
  }, [role]);

  const selectedPackage =
    targetPackage === "custom" ? customPackage.trim() : targetPackage;

  const canGenerate =
    role.trim().length > 0 &&
    selectedPackage.length > 0 &&
    !loading &&
    (!useResume || Boolean(resume));

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setRoleSearchOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canGenerate) return;

    await onGenerate({
      role: role.trim(),
      targetPackage: selectedPackage,
      useResume,
      resume: useResume ? resume : null,

      // These are intentionally not sent yet.
      // Backend contract currently only accepts:
      // role, targetPackage, useResume, resume.
      experienceLevel,
      hoursPerDay,
    });
  };

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#101010] shadow-2xl shadow-black/20">
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-violet-500/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-blue-500/[0.05] blur-3xl" />

      <div className="relative p-5 sm:p-7 lg:p-10">
        {/* Header */}
        <header className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[11px] font-medium text-white/55">
            <FiSparkles size={13} className="text-violet-300" />
            Personalized with AI
          </div>

          <h1 className="text-[30px] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl lg:text-[44px]">
            Build a roadmap for where you want to go.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-white/42 sm:text-[15px]">
            Tell RIO your target. We&apos;ll turn it into a focused learning
            path without unnecessary topics or tutorial overload.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="relative mt-8 space-y-5">
          {/* Target role */}
          <div>
            <label
              htmlFor="roadmap-role"
              className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35"
            >
              Target role
            </label>

            <div className="relative">
              <FiBriefcase
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
              />

              <input
                id="roadmap-role"
                type="text"
                value={role}
                disabled={loading}
                autoComplete="off"
                placeholder="What role are you targeting?"
                onFocus={() => setRoleSearchOpen(true)}
                onChange={(event) => {
                  setRole(event.target.value);
                  setRoleSearchOpen(true);
                }}
                className="w-full rounded-2xl border border-white/[0.09] bg-black/25 py-4 pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-white/22 focus:border-white/20 focus:bg-white/[0.035] disabled:cursor-not-allowed disabled:opacity-50"
              />

              {role && (
                <button
                  type="button"
                  onClick={() => {
                    setRole("");
                    setRoleSearchOpen(true);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 transition hover:text-white/65"
                  aria-label="Clear role"
                >
                  <FiX size={15} />
                </button>
              )}

              {roleSearchOpen && !loading && (
                <>
                  <button
                    type="button"
                    aria-label="Close role picker"
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setRoleSearchOpen(false)}
                  />

                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#151515] shadow-2xl shadow-black/40">
                    <div className="max-h-[280px] overflow-y-auto p-2">
                      {filteredRoles.length > 0 ? (
                        <>
                          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                            {role.trim() ? "Matching roles" : "Popular roles"}
                          </p>

                          {filteredRoles.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => selectRole(item)}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white/65 transition hover:bg-white/[0.05] hover:text-white"
                            >
                              <FiSearch
                                size={13}
                                className="shrink-0 text-white/25"
                              />

                              <span>{item}</span>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="px-3 py-5">
                          <p className="text-sm text-white/55">
                            No exact role found.
                          </p>

                          <p className="mt-1 text-xs leading-5 text-white/25">
                            That&apos;s okay. You can continue with your own
                            role name.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {!role && (
              <div className="mt-3 flex flex-wrap gap-2">
                {POPULAR_ROLES.slice(0, 4).map((item) => (
                  <button
                    key={item}
                    type="button"
                    disabled={loading}
                    onClick={() => selectRole(item)}
                    className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[11px] text-white/38 transition hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white/70 disabled:opacity-40"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Package */}
          <div>
            <label
              htmlFor="roadmap-package"
              className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35"
            >
              Target compensation
            </label>

            <div className="relative">
              <FiTarget
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
              />

              <select
                id="roadmap-package"
                value={targetPackage}
                disabled={loading}
                onChange={(event) => setTargetPackage(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-white/[0.09] bg-black/25 px-11 py-4 text-sm text-white outline-none transition focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {PACKAGE_OPTIONS.map((item) => (
                  <option key={item} value={item} className="bg-[#151515]">
                    {item}
                  </option>
                ))}

                <option value="custom" className="bg-[#151515]">
                  Custom target
                </option>
              </select>

              <FiChevronDown
                size={15}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/25"
              />
            </div>

            {targetPackage === "custom" && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customPackage}
                  disabled={loading}
                  onChange={(event) => setCustomPackage(event.target.value)}
                  placeholder="e.g. ₹45 LPA or $150k"
                  className="w-full rounded-2xl border border-white/[0.09] bg-black/25 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/22 focus:border-white/20"
                />
              </div>
            )}
          </div>

          {/* Resume personalization */}
          <div>
            <button
              type="button"
              disabled={loading}
              onClick={() => setUseResume((current) => !current)}
              className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                useResume
                  ? "border-violet-400/20 bg-violet-400/[0.06]"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14]"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    useResume
                      ? "bg-violet-400/10 text-violet-300"
                      : "bg-white/[0.05] text-white/30"
                  }`}
                >
                  <FiFileText size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/80">
                    Personalize with my resume
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/30">
                    RIO can adapt the roadmap around what you already know.
                  </p>
                </div>
              </div>

              <div
                className={`ml-4 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${
                  useResume ? "bg-violet-400" : "bg-white/10"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    useResume ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            {useResume && !resume && (
              <p className="mt-2 text-xs text-amber-300/70">
                Add a resume first to use resume personalization.
              </p>
            )}
          </div>

          {/* Advanced personalization */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.018]">
            <button
              type="button"
              onClick={() => setAdvancedOpen((current) => !current)}
              className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-white/[0.025]"
            >
              <div>
                <p className="text-sm font-medium text-white/65">
                  Advanced personalization
                </p>

                <p className="mt-1 text-xs text-white/25">
                  Optional — refine how RIO plans your journey.
                </p>
              </div>

              {advancedOpen ? (
                <FiChevronUp size={15} className="text-white/30" />
              ) : (
                <FiChevronDown size={15} className="text-white/30" />
              )}
            </button>

            {advancedOpen && (
              <div className="grid gap-4 border-t border-white/[0.06] p-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="experience-level"
                    className="mb-2 block text-xs text-white/35"
                  >
                    Current level
                  </label>

                  <select
                    id="experience-level"
                    value={experienceLevel}
                    disabled={loading}
                    onChange={(event) => setExperienceLevel(event.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-black/20 px-3 py-3 text-sm text-white/70 outline-none focus:border-white/20"
                  >
                    <option value="" className="bg-[#151515]">
                      Let RIO decide
                    </option>

                    <option value="beginner" className="bg-[#151515]">
                      Beginner
                    </option>

                    <option value="intermediate" className="bg-[#151515]">
                      Intermediate
                    </option>

                    <option value="advanced" className="bg-[#151515]">
                      Advanced
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="hours-per-day"
                    className="mb-2 block text-xs text-white/35"
                  >
                    Available time
                  </label>

                  <div className="relative">
                    <FiClock
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
                    />

                    <select
                      id="hours-per-day"
                      value={hoursPerDay}
                      disabled={loading}
                      onChange={(event) => setHoursPerDay(event.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/[0.08] bg-black/20 py-3 pl-9 pr-3 text-sm text-white/70 outline-none focus:border-white/20"
                    >
                      <option value="" className="bg-[#151515]">
                        Let RIO decide
                      </option>

                      <option value="1" className="bg-[#151515]">
                        ~1 hour/day
                      </option>

                      <option value="2" className="bg-[#151515]">
                        ~2 hours/day
                      </option>

                      <option value="3" className="bg-[#151515]">
                        ~3 hours/day
                      </option>

                      <option value="4+" className="bg-[#151515]">
                        4+ hours/day
                      </option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <p className="flex items-center gap-2 text-xs leading-5 text-white/25">
                    <FiSparkles size={12} />
                    Optional details can make the roadmap more personalized. You
                    can skip them and let RIO decide.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3"
            >
              <p className="text-sm leading-5 text-red-300/80">{error}</p>
            </div>
          )}

          {/* Footer action */}
          <div className="flex flex-col gap-4 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-white/25">
              <FiSparkles size={12} />

              <span>Focused path. Less noise. Clear next steps.</span>
            </div>

            <button
              type="submit"
              disabled={!canGenerate}
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/15 border-t-black" />
                  Building your roadmap
                </>
              ) : (
                <>
                  Generate roadmap
                  <FiArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default RoadmapGenerator;
