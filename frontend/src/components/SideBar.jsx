import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiHome,
  FiLogOut,
  FiMap,
  FiSettings,
  FiStar,
  FiUser,
  FiX,
} from "react-icons/fi";
import { GiJetPack } from "react-icons/gi";
import { IoAddOutline } from "react-icons/io5";
import { MdWavingHand } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar({ user, mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showWave, setShowWave] = useState(true);

  const touchStartX = useRef(null);

  const firstName = user?.name?.split(" ")[0] || "User";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWave(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  const navigationItems = [
    {
      label: "Overview",
      icon: FiHome,
      path: "/dashboard",
    },
    {
      label: "Resume Builder",
      icon: FiFileText,
      path: "/resume",
    },
    {
      label: "Resume Scorer",
      icon: FiStar,
      path: "/resume-score",
    },
    {
      label: "Roadmap Builder",
      icon: FiMap,
      path: "/roadmap",
    },
    {
      label: "Progress",
      icon: FiBarChart2,
      path: "/progress",
    },
  ];

  const accountItems = [
    {
      label: "Profile",
      icon: FiUser,
      path: "/profile",
    },
    {
      label: "Settings",
      icon: FiSettings,
      path: "/settings",
    },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen?.(false);
  };

  const handleLogout = async () => {
    try {
      // Keep the existing logout flow here when backend logout is wired.
      navigate("/");
      setMobileOpen?.(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSidebarTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleSidebarTouchEnd = (event) => {
    if (touchStartX.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;

    if (deltaX < -60) {
      setMobileOpen?.(false);
    }

    touchStartX.current = null;
  };

  const handleEdgeTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleEdgeTouchEnd = (event) => {
    if (touchStartX.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;

    if (deltaX > 60) {
      setMobileOpen?.(true);
    }

    touchStartX.current = null;
  };

  const brand = (isExpanded = true) => (
    <button
      type="button"
      onClick={() => handleNavigation("/dashboard")}
      className={`group flex items-center ${
        isExpanded ? "gap-3" : "justify-center"
      }`}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${
          isExpanded ? "h-10 w-10" : "h-9 w-9"
        }`}
      >
        <GiJetPack size={isExpanded ? 23 : 20} className="text-white" />
      </div>

      {isExpanded && (
        <div className="text-left">
          <div
            className="text-[17px] leading-none tracking-tight text-white"
            style={{ fontFamily: '"Zen Dots", sans-serif' }}
          >
            RIO
          </div>

          <div className="mt-1 text-[8px] font-semibold uppercase tracking-[0.20em] text-[#71717A]">
            Career Intelligence
          </div>
        </div>
      )}
    </button>
  );

  const renderNavigationItems = (isExpanded) => (
    <nav className="space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <button
            key={item.path}
            type="button"
            onClick={() => handleNavigation(item.path)}
            title={!isExpanded ? item.label : undefined}
            className={`group relative flex w-full items-center rounded-xl transition-colors duration-200 ${
              isExpanded ? "gap-3 px-3 py-2.5" : "justify-center px-2 py-3"
            } ${
              active
                ? "bg-white/[0.09] text-white"
                : "text-[#71717A] hover:bg-white/[0.045] hover:text-[#D4D4D8]"
            }`}
          >
            {active && (
              <span className="absolute left-0 h-5 w-[2px] rounded-full bg-white" />
            )}

            <Icon size={17} strokeWidth={1.7} className="shrink-0" />

            {isExpanded && (
              <span className="truncate text-[12px] font-medium">
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  const renderAccountItems = (isExpanded) => (
    <nav className="space-y-1">
      {accountItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <button
            key={item.path}
            type="button"
            onClick={() => handleNavigation(item.path)}
            title={!isExpanded ? item.label : undefined}
            className={`group relative flex w-full items-center rounded-xl transition-colors duration-200 ${
              isExpanded ? "gap-3 px-3 py-2.5" : "justify-center px-2 py-3"
            } ${
              active
                ? "bg-white/[0.09] text-white"
                : "text-[#71717A] hover:bg-white/[0.045] hover:text-[#D4D4D8]"
            }`}
          >
            {active && (
              <span className="absolute left-0 h-5 w-[2px] rounded-full bg-white" />
            )}

            <Icon size={17} strokeWidth={1.7} className="shrink-0" />

            {isExpanded && (
              <span className="truncate text-[12px] font-medium">
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  const userSection = (isExpanded) => (
    <div
      className={`shrink-0 border-t border-white/[0.08] ${
        isExpanded ? "p-3" : "p-2"
      }`}
    >
      {isExpanded ? (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-[#17191C]">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[14px] font-bold leading-tight text-[#A1A1AA]">
                  {firstName}
                </span>

                {showWave && (
                  <motion.span
                    initial={{
                      x: -8,
                      y: 8,
                      rotate: -35,
                      opacity: 0,
                    }}
                    animate={{
                      x: [0, 12, 20, 12, 0],
                      y: [8, -2, -10, -3, 5],
                      rotate: [-35, 15, 40, 8, -12],
                      opacity: [0, 1, 1, 1, 0],
                    }}
                    transition={{
                      duration: 1.6,
                      ease: "easeInOut",
                    }}
                    className="origin-bottom-left"
                  >
                    <MdWavingHand size={15} className="text-[#A1A1AA]" />
                  </motion.span>
                )}
              </div>

              <p className="mt-1 truncate text-[10px] text-[#71717A]">
                {user?.email || "RIO member"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#71717A] transition-colors hover:bg-white/[0.06] hover:text-white"
              aria-label="Logout"
              title="Logout"
            >
              <FiLogOut size={15} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => handleNavigation("/profile")}
          className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xs font-bold text-[#17191C]"
          title={firstName}
        >
          {initials}
        </button>
      )}
    </div>
  );

  const sidebarContent = (isExpanded, showDesktopToggle = true) => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div
        className={`flex h-[72px] shrink-0 items-center border-b border-white/[0.08] ${
          isExpanded ? "justify-between px-4" : "justify-between px-2"
        }`}
      >
        {brand(isExpanded)}

        {showDesktopToggle && (
          <button
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#71717A] transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? (
              <FiChevronLeft size={16} />
            ) : (
              <FiChevronRight size={16} />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-2">
        {isExpanded && (
          <p className="px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#52525B]">
            Workspace
          </p>
        )}

        {renderNavigationItems(isExpanded)}

        {isExpanded && <div className="my-5 h-px bg-white/[0.07]" />}

        {isExpanded && (
          <p className="px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#52525B]">
            Account
          </p>
        )}

        {renderAccountItems(isExpanded)}
      </div>

      {/* User */}
      {userSection(isExpanded)}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-white/[0.08] bg-[#111315] transition-[width] duration-300 md:block ${
          sidebarOpen ? "w-[250px]" : "w-[76px]"
        }`}
      >
        {sidebarContent(sidebarOpen)}
      </aside>

      {/* Floating Create Interview */}
      <button
        type="button"
        onClick={() => handleNavigation("/interview")}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.12] bg-white text-[#17191C] shadow-[0_12px_35px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:scale-[1.04] md:h-13 md:w-13"
        aria-label="Create Interview"
        title="Create Interview"
      >
        <IoAddOutline size={24} strokeWidth={1.8} />
      </button>

      {/* Mobile edge swipe area */}
      {!mobileOpen && (
        <div
          onTouchStart={handleEdgeTouchStart}
          onTouchEnd={handleEdgeTouchEnd}
          className="fixed left-0 top-0 z-40 h-full w-6 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
              aria-label="Close navigation"
            />

            <motion.aside
              initial={{ x: -290 }}
              animate={{ x: 0 }}
              exit={{ x: -290 }}
              transition={{
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              onTouchStart={handleSidebarTouchStart}
              onTouchEnd={handleSidebarTouchEnd}
              className="fixed inset-y-0 left-0 z-[60] w-[285px] border-r border-white/[0.1] bg-[#111315] shadow-2xl md:hidden"
            >
              <div className="relative h-full">
                {/* Mobile close */}
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="absolute right-3 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#A1A1AA] transition-colors hover:text-white"
                  aria-label="Close navigation"
                >
                  <FiX size={17} />
                </button>

                {sidebarContent(true, false)}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
