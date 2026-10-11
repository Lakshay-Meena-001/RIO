import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiLayers,
  FiMenu,
  FiSearch,
  FiTarget,
  FiX,
  FiZap,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import Sidebar from "../../components/SideBar";
import {
  getRoadmapCatalog,
  getRoadmapCategories,
  generateRoadmap,
} from "../../api/roadmap.api.js";

const inputClass =
  "w-full rounded-xl border border-white/[0.10] bg-[#191B1F] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#686B74] hover:border-white/[0.17] focus:border-white/30 focus:bg-[#1D1F23]";

const packages = [
  {
    id: "foundation",
    title: "Foundation",
    description: "Start with the essential phases and core concepts.",
    detail: "A focused starting point",
    icon: FiBookOpen,
  },
  {
    id: "standard",
    title: "Standard",
    description: "A balanced path through the roadmap's main phases.",
    detail: "Recommended for most learners",
    icon: FiLayers,
  },
  {
    id: "comprehensive",
    title: "Comprehensive",
    description: "Choose the broadest available learning path.",
    detail: "For deeper coverage",
    icon: FiZap,
  },
];

const unwrap = (response) => response?.data ?? response ?? null;

const getList = (response, keys) => {
  const value = unwrap(response);
  if (Array.isArray(value)) return value;
  for (const key of keys) {
    if (Array.isArray(value?.[key])) return value[key];
    if (Array.isArray(value?.data?.[key])) return value.data[key];
  }
  return [];
};

const roadmapIdOf = (roadmap) =>
  roadmap?.catalogRoadmapId ||
  roadmap?._id ||
  roadmap?.id ||
  roadmap?.roadmapId ||
  "";

const titleOf = (roadmap) =>
  roadmap?.title || roadmap?.name || "Untitled roadmap";
const summaryOf = (roadmap) =>
  roadmap?.summary ||
  roadmap?.description ||
  roadmap?.goal ||
  "A structured learning path with guided phases and progress tracking.";

function SectionHeading({ number, icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:gap-3 sm:text-left">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-[#D4D4D8]">
        <Icon size={17} />
      </div>
      <div className="min-w-0 sm:text-left">
        <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#777B85]">
          {number}
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">
          {title}
        </h2>
        <p className="mx-auto mb-2 mt-1 max-w-md text-xs leading-5 text-[#858994] sm:mx-0 sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function RoadmapBuilderPage({ user, setUser }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [roadmaps, setRoadmaps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState("");
  const [packageId, setPackageId] = useState("standard");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showRoadmaps, setShowRoadmaps] = useState(true);
  const [showPackages, setShowPackages] = useState(true);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [generatedUserRoadmapId, setGeneratedUserRoadmapId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCatalogue = useCallback(async () => {
    setError("");

    try {
      const [catalogResponse, categoryResponse] = await Promise.all([
        getRoadmapCatalog(),
        getRoadmapCategories().catch(() => null),
      ]);

      const catalog = getList(catalogResponse, [
        "roadmaps",
        "catalog",
        "items",
        "results",
      ]);

      const categoryList = getList(categoryResponse, [
        "categories",
        "items",
        "results",
      ]);

      setRoadmaps(catalog);
      setCategories(categoryList);

      setSelectedRoadmapId((current) => {
        if (
          current &&
          catalog.some((item) => String(roadmapIdOf(item)) === String(current))
        ) {
          return current;
        }

        return roadmapIdOf(catalog[0]) ?? "";
      });
    } catch (loadError) {
      setRoadmaps([]);
      setCategories([]);

      setError(
        loadError?.response?.data?.message ||
          loadError?.message ||
          "Could not load the roadmap catalogue. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const [catalogResponse, categoryResponse] = await Promise.all([
          getRoadmapCatalog(),
          getRoadmapCategories().catch(() => null),
        ]);

        if (cancelled) return;

        const catalog = getList(catalogResponse, [
          "roadmaps",
          "catalog",
          "items",
          "results",
        ]);

        const categoryList = getList(categoryResponse, [
          "categories",
          "items",
          "results",
        ]);

        setRoadmaps(catalog);
        setCategories(categoryList);

        setSelectedRoadmapId((current) => {
          if (
            current &&
            catalog.some(
              (item) => String(roadmapIdOf(item)) === String(current),
            )
          ) {
            return current;
          }

          return roadmapIdOf(catalog[0]) ?? "";
        });

        setError("");
      } catch (loadError) {
        if (cancelled) return;

        setRoadmaps([]);
        setCategories([]);

        setError(
          loadError?.response?.data?.message ||
            loadError?.message ||
            "Could not load the roadmap catalogue. Please try again.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedRoadmap = useMemo(
    () =>
      roadmaps.find(
        (item) => String(roadmapIdOf(item)) === String(selectedRoadmapId),
      ) || null,
    [roadmaps, selectedRoadmapId],
  );

  const filteredRoadmaps = useMemo(() => {
    const query = search.trim().toLowerCase();
    return roadmaps.filter((item) => {
      const matchesCategory =
        category === "all" ||
        String(item?.category || item?.categoryName || "").toLowerCase() ===
          String(category).toLowerCase();
      const matchesSearch =
        !query ||
        [
          item?.title,
          item?.name,
          item?.summary,
          item?.description,
          item?.category,
          item?.categoryName,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [roadmaps, search, category]);

  const submit = async (event) => {
    event.preventDefault();
    if (!selectedRoadmapId) {
      setError("Choose a roadmap from the catalogue first.");
      return;
    }
    setGenerating(true);
    setGenerationComplete(false);
    setError("");
    setNotice("");
    try {
      const response = await generateRoadmap({
        roadmapId: String(selectedRoadmapId).trim(),
        packageId,
      });
      const payload = unwrap(response);
      const userRoadmap =
        payload?.userRoadmap ||
        payload?.data?.userRoadmap ||
        payload?.roadmap?.userRoadmap;
      const userRoadmapId =
        userRoadmap?._id || userRoadmap?.id || payload?.userRoadmapId;
      if (!userRoadmapId) {
        throw new Error("The server did not return a user roadmap ID.");
      }
      setGeneratedUserRoadmapId(String(userRoadmapId));
      setGenerationComplete(true);
      setNotice(`${titleOf(selectedRoadmap)} is ready to open.`);
    } catch (generateError) {
      setError(
        generateError?.response?.data?.message ||
          generateError?.message ||
          "Roadmap generation failed. Please try again.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const openGeneratedRoadmap = () => {
    if (generatedUserRoadmapId) navigate(`/roadmap/${generatedUserRoadmapId}`);
  };

  const categoryOptions = useMemo(() => {
    const fromApi = categories
      .map((item) => {
        if (typeof item === "string") return { value: item, label: item };
        const value = item?.slug || item?.id || item?.name || item?.category;
        const label = item?.label || item?.title || item?.name || value;
        return value ? { value: String(value), label: String(label) } : null;
      })
      .filter(Boolean);
    if (fromApi.length) return fromApi;
    return [
      ...new Set(
        roadmaps
          .map((item) => item?.category || item?.categoryName)
          .filter(Boolean),
      ),
    ].map((value) => ({ value: String(value), label: String(value) }));
  }, [categories, roadmaps]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#17191C] text-white">
      <style>{`
        .rio-range { height: 5px; appearance: none; -webkit-appearance: none; border-radius: 9999px; outline: none; }
        .rio-range::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; width: 17px; height: 17px; border-radius: 9999px; border: 3px solid #17191C; background: #F4F4F5; box-shadow: 0 0 0 1px rgba(255,255,255,.42); }
        .rio-range::-moz-range-thumb { width: 12px; height: 12px; border-radius: 9999px; border: 3px solid #17191C; background: #F4F4F5; box-shadow: 0 0 0 1px rgba(255,255,255,.42); }
      `}</style>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 100% 0%, rgba(255,255,255,.055), transparent 70%), radial-gradient(ellipse 60% 55% at 0% 100%, rgba(255,255,255,.025), transparent 72%)",
        }}
      />

      <header className="fixed left-3 right-3 top-3 z-40 flex h-14 items-center justify-between rounded-2xl border border-white/10 bg-[#17191C]/90 px-3 backdrop-blur-xl md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]"
        >
          <FiMenu size={18} />
        </button>
        <span
          className="text-base tracking-wide"
          style={{ fontFamily: '"Zen Dots", sans-serif' }}
        >
          RIO
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xs font-semibold">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </span>
      </header>

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          user={user}
          sidebarOpen={sidebarOpen}
          setUser={setUser}
          setSidebarOpen={setSidebarOpen}
        />
        <main
          className={`min-w-0 flex-1 transition-[margin-left] duration-300 ${sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"}`}
        >
          <div className="mx-auto w-full max-w-none px-3 pb-22 pt-[82px] sm:px-6 sm:pb-16 lg:px-8 lg:py-8 lg:pb-4">
            <button
              type="button"
              onClick={() => navigate("/roadmap")}
              className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-[#92959E] transition hover:text-white"
            >
              <FiArrowLeft size={14} />
              Back to roadmaps
            </button>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-6 flex flex-col items-center gap-4 sm:mb-7 sm:items-start sm:text-left lg:flex-row lg:items-end lg:justify-between"
            >
              <div className="max-w-2xl">
                <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#858994]">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  Roadmap Studio
                </p>
                <h1 className="text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">
                  Build your{" "}
                  <span className="font-serif font-normal italic text-[#B8BAC1]">
                    learning path.
                  </span>
                </h1>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#92959E] sm:mx-0">
                  Choose a roadmap from the catalogue, select how much coverage
                  you want, and start learning.
                </p>
              </div>
            </motion.div>

            <AnimatePresence initial={false}>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 overflow-hidden"
                >
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-[#DCA47A]/20 bg-[#DCA47A]/[0.06] px-4 py-3 text-sm text-[#E6C2A4]"
                  >
                    <FiX className="mt-0.5 shrink-0" size={15} />
                    <p className="flex-1">{error}</p>
                    <button
                      type="button"
                      onClick={() => setError("")}
                      aria-label="Dismiss error"
                    >
                      <FiX size={15} />
                    </button>
                  </div>
                </motion.div>
              )}
              {notice && (
                <motion.div
                  key="notice"
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 overflow-hidden"
                >
                  <div
                    role="status"
                    className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs text-[#D4D4D8]"
                  >
                    {notice}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form id="roadmap-builder-form" onSubmit={submit}>
              <div className="grid w-full min-w-0 items-start gap-4">
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.04 }}
                  className="rounded-2xl border border-white/[0.09] bg-[#111316] p-4 sm:p-5"
                >
                  <SectionHeading
                    number="01 / Direction"
                    icon={FiTarget}
                    title="Where do you want to go?"
                    description="Select a roadmap from RIO's catalogue. These roadmaps are structured and maintained centrally."
                  />
                  <div className="rounded-xl border border-white/[0.09] bg-white/[0.025] p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-[#D4D4D8]">
                        <FiLayers size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777B85]">
                          Selected roadmap
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-white">
                          {selectedRoadmap
                            ? titleOf(selectedRoadmap)
                            : loading
                              ? "Loading roadmaps…"
                              : "Choose a roadmap"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowRoadmaps((value) => !value)}
                        aria-expanded={showRoadmaps}
                        aria-label={
                          showRoadmaps
                            ? "Close roadmap list"
                            : "Open roadmap list"
                        }
                        className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] text-[#A1A1AA] transition hover:bg-white/[0.08] hover:text-white sm:ml-0 sm:h-auto sm:w-auto sm:gap-1.5 sm:rounded-lg sm:px-3 sm:py-2 sm:text-xs sm:font-medium sm:text-[#D4D4D8]"
                      >
                        <motion.span
                          animate={{ rotate: showRoadmaps ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FiChevronDown size={15} />
                        </motion.span>
                        <span className="hidden sm:inline">
                          {showRoadmaps ? "Hide" : "Change"}
                        </span>
                      </button>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_220px]">
                      <label className="relative block w-full">
                        <FiSearch
                          size={15}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777B85]"
                        />
                        <input
                          type="search"
                          value={search}
                          onFocus={() => setShowRoadmaps(true)}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Search roadmaps…"
                          aria-label="Search roadmaps"
                          className={`${inputClass} py-3 pl-10`}
                        />
                      </label>
                      <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        aria-label="Filter by category"
                        className={inputClass}
                      >
                        <option value="all" className="bg-[#191B1F]">
                          All categories
                        </option>
                        {categoryOptions.map((item) => (
                          <option
                            key={item.value}
                            value={item.value}
                            className="bg-[#191B1F]"
                          >
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <AnimatePresence initial={false}>
                      {showRoadmaps && (
                        <motion.div
                          initial={{ height: 0, opacity: 0, y: -5 }}
                          animate={{ height: "auto", opacity: 1, y: 0 }}
                          exit={{ height: 0, opacity: 0, y: -5 }}
                          transition={{ duration: 0.24, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3">
                            {loading ? (
                              <div className="grid gap-2 sm:grid-cols-2">
                                {[1, 2, 3, 4].map((item) => (
                                  <div
                                    key={item}
                                    className="h-24 animate-pulse rounded-xl border border-white/[0.07] bg-white/[0.025]"
                                  />
                                ))}
                              </div>
                            ) : roadmaps.length === 0 ? (
                              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 text-sm text-[#A1A1AA]">
                                No roadmaps are available in the catalogue right
                                now.
                                <button
                                  type="button"
                                  onClick={loadCatalogue}
                                  className="ml-2 inline-flex items-center gap-1 font-medium text-white"
                                >
                                  <FiRefreshCw size={12} />
                                  Try again
                                </button>
                              </div>
                            ) : filteredRoadmaps.length === 0 ? (
                              <p className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 text-sm text-[#858994]">
                                No roadmaps match your search.
                              </p>
                            ) : (
                              <div className="grid items-stretch gap-2 sm:grid-cols-2">
                                {filteredRoadmaps.map((roadmap) => {
                                  const id = roadmapIdOf(roadmap);
                                  const active =
                                    String(selectedRoadmapId) === String(id);
                                  return (
                                    <button
                                      key={String(id)}
                                      type="button"
                                      onClick={() => {
                                        setSelectedRoadmapId(String(id));
                                        setShowRoadmaps(false);
                                        setError("");
                                        setNotice("");
                                      }}
                                      aria-pressed={active}
                                      className={`group flex h-full min-h-[112px] w-full items-start gap-3 rounded-xl border p-3 text-left transition duration-200 ${active ? "border-white/25 bg-white/[0.075]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.04]"}`}
                                    >
                                      <span
                                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${active ? "border-white/20 bg-white/[0.09] text-white" : "border-white/10 bg-white/[0.04] text-[#A1A1AA]"}`}
                                      >
                                        <FiBookOpen size={15} />
                                      </span>
                                      <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-white">
                                          {titleOf(roadmap)}
                                        </span>
                                        <span
                                          className="mt-1 block text-xs leading-5 text-[#858994]"
                                          style={{
                                            display: "-webkit-box",
                                            WebkitBoxOrient: "vertical",
                                            WebkitLineClamp: 3,
                                            overflow: "hidden",
                                          }}
                                        >
                                          {summaryOf(roadmap)}
                                        </span>
                                        {(roadmap.category ||
                                          roadmap.categoryName) && (
                                          <span className="mt-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-[#777B85]">
                                            {roadmap.category ||
                                              roadmap.categoryName}
                                          </span>
                                        )}
                                      </span>
                                      {active && (
                                        <FiCheck
                                          className="mt-1 shrink-0"
                                          size={15}
                                        />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {selectedRoadmap && (
                    <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777B85]">
                        Your selection
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-white">
                        {titleOf(selectedRoadmap)}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[#858994]">
                        {summaryOf(selectedRoadmap)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedRoadmap.totalPhases ||
                        selectedRoadmap.phaseCount ? (
                          <span className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 text-[10px] text-[#A1A1AA]">
                            {selectedRoadmap.totalPhases ||
                              selectedRoadmap.phaseCount}{" "}
                            phases
                          </span>
                        ) : null}
                        {selectedRoadmap.category ||
                        selectedRoadmap.categoryName ? (
                          <span className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 text-[10px] text-[#A1A1AA]">
                            {selectedRoadmap.category ||
                              selectedRoadmap.categoryName}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )}
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.08 }}
                  className="rounded-2xl border border-white/[0.09] bg-[#111316] p-4 sm:p-5"
                >
                  <SectionHeading
                    number="02 / Coverage"
                    icon={FiBookOpen}
                    title="Choose your learning coverage."
                    description="The package controls the coverage of your generated roadmap. You can start learning after generation."
                  />
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/[0.09] bg-white/[0.025] p-3 sm:p-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777B85]">
                        Selected package
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {packages.find((item) => item.id === packageId)
                          ?.title || "Standard"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPackages((value) => !value)}
                      aria-expanded={showPackages}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.035] px-3 py-2 text-xs font-medium text-[#D4D4D8] transition hover:bg-white/[0.08]"
                    >
                      {showPackages ? "Hide options" : "Change package"}
                      <FiChevronDown
                        className={`transition-transform ${showPackages ? "rotate-180" : ""}`}
                        size={14}
                      />
                    </button>
                  </div>
                  <AnimatePresence initial={false}>
                    {showPackages && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, y: -5 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -5 }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-2 pt-1 sm:grid-cols-3">
                          {packages.map((item) => {
                            const Icon = item.icon;
                            const active = packageId === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setPackageId(item.id);
                                  setError("");
                                }}
                                aria-pressed={active}
                                className={`flex min-h-[150px] items-start gap-3 rounded-xl border p-3 text-left transition ${active ? "border-white/25 bg-white/[0.075]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.04]"}`}
                              >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#D4D4D8]">
                                  <Icon size={15} />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-semibold text-white">
                                      {item.title}
                                    </span>
                                    {active && <FiCheck size={14} />}
                                  </span>
                                  <span className="mt-2 block text-xs leading-5 text-[#858994]">
                                    {item.description}
                                  </span>
                                  <span className="mt-3 block text-[10px] font-medium text-[#C4C6CC]">
                                    {item.detail}
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.section>
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t border-white/[0.09] pt-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">
                    Ready to start learning?
                  </p>
                  <p className="mt-1 text-xs text-[#858994]">
                    {selectedRoadmap
                      ? titleOf(selectedRoadmap)
                      : "Choose a roadmap"}
                    <span className="mx-2 text-white/20">·</span>
                    {packages.find((item) => item.id === packageId)?.title}{" "}
                    coverage
                  </p>
                </div>
                <div className="hidden shrink-0 items-center justify-end gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={() => navigate("/roadmap")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.13] bg-white/[0.035] px-4 py-3 text-sm font-medium text-[#E4E4E7] transition hover:bg-white/[0.08]"
                  >
                    <FiClock size={15} />
                    Dashboard
                  </button>
                  <button
                    type="submit"
                    disabled={loading || generating || !selectedRoadmapId}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#17191C] transition hover:-translate-y-0.5 hover:bg-[#E7E7E7] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {generating ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                    ) : (
                      <FiZap size={15} />
                    )}
                    {generating ? "Creating roadmap…" : "Create roadmap"}
                    {!generating && <FiArrowRight size={15} />}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#111315]/[0.92] p-3 backdrop-blur-xl sm:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/roadmap")}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-xs font-semibold text-[#D4D4D8]"
          >
            <FiClock size={14} />
            <span>Dashboard</span>
          </button>
          <button
            type="submit"
            form="roadmap-builder-form"
            disabled={loading || generating || !selectedRoadmapId}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-semibold text-[#17191C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
            ) : (
              <FiZap size={14} />
            )}
            <span>{generating ? "Creating…" : "Create roadmap"}</span>
            {!generating && <FiArrowRight size={14} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(generating || generationComplete) && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="roadmap-generation-title"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#17191C] p-6 shadow-[0_30px_100px_rgba(0,0,0,.5)]"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                {generationComplete ? (
                  <FiCheck size={24} className="text-white" />
                ) : (
                  <FiLayers size={23} className="animate-pulse text-white" />
                )}
              </div>
              <h2
                id="roadmap-generation-title"
                className="mt-5 text-center text-xl font-semibold tracking-tight"
              >
                {generationComplete
                  ? "Your roadmap is ready"
                  : "Creating your roadmap"}
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-[#A1A1AA]">
                {generationComplete
                  ? "Your personal learning workspace has been created. Open it to generate phases and track your progress."
                  : "RIO is setting up your learning workspace. This may take a little while."}
              </p>
              {!generationComplete ? (
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <motion.div
                    className="h-full w-1/3 rounded-full bg-white"
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{
                      duration: 1.35,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openGeneratedRoadmap}
                  disabled={!generatedUserRoadmapId}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#17191C] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Open roadmap <FiArrowRight size={15} />
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
