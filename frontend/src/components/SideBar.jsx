import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logoutUser } from "../api/user.api.js";
import { FiPlusCircle } from "react-icons/fi";
import {
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiFileText,
  FiHome,
  FiLogOut,
  FiMap,
  FiSettings,
  FiStar,
  FiUser,
  FiX,
} from "react-icons/fi";
import { IoAddOutline } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar({
  user,
  setUser,
  mobileOpen,
  setMobileOpen,
  sidebarOpen,
  setSidebarOpen,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const touchStartX = useRef(null);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const preventBackgroundScroll = (event) => {
      if (!event.target.closest('[data-mobile-sidebar="true"]')) {
        event.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventBackgroundScroll, {
      passive: false,
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      document.removeEventListener("touchmove", preventBackgroundScroll);
    };
  }, [mobileOpen]);

  const firstName = user?.name?.split(" ")[0] || "User";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const credits = user?.coins ?? 0;

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
      await logoutUser();

      setUser(null);
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

  const brand = (isExpanded = true, animateBrand = false) => (
    <button
      type="button"
      onClick={() => handleNavigation("/dashboard")}
      className={`group flex items-center ${
        isExpanded ? "gap-3" : "justify-center"
      }`}
    >
      <div className="relative shrink-0 text-left">
        <div
          className={`leading-none tracking-tight text-white ${
            isExpanded ? "text-[17px]" : "text-[16px]"
          }`}
          style={{ fontFamily: '"Zen Dots", sans-serif' }}
        >
          RIO
        </div>

        <div
          className={`pointer-events-none absolute left-0 top-[calc(100%+4px)] whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.20em] text-[#71717A] transition-[opacity,transform] duration-300 ease-out ${
            !isExpanded
              ? "translate-x-0 opacity-0"
              : animateBrand
                ? "translate-x-0 opacity-100 delay-[320ms]"
                : "translate-x-0 opacity-100"
          }`}
        >
          Career Intelligence
        </div>
      </div>
    </button>
  );

  const renderNavigationItems = (isExpanded, stagger = false) => (
    <nav className="space-y-1">
      {navigationItems.map((item, index) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        const itemAnimationClass = stagger
          ? isExpanded
            ? "translate-x-0 opacity-100"
            : "-translate-x-2 opacity-0"
          : "translate-x-0 opacity-100";

        return (
          <button
            key={item.path}
            type="button"
            onClick={() => handleNavigation(item.path)}
            title={!isExpanded ? item.label : undefined}
            className={`group relative flex w-full items-center rounded-xl transition-[opacity,transform,background-color,color] duration-300 ease-out ${
              isExpanded ? "gap-3 px-3 py-2.5" : "justify-center px-2 py-3"
            } ${itemAnimationClass} ${
              active
                ? "bg-white/[0.09] text-white"
                : "text-[#71717A] hover:bg-white/[0.045] hover:text-[#D4D4D8]"
            }`}
            style={
              stagger && isExpanded
                ? { transitionDelay: `${320 + index * 55}ms` }
                : undefined
            }
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

  const renderAccountItems = (isExpanded, stagger = false) => (
    <nav className="space-y-1">
      {accountItems.map((item, index) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        const itemAnimationClass = stagger
          ? isExpanded
            ? "translate-x-0 opacity-100"
            : "-translate-x-2 opacity-0"
          : "translate-x-0 opacity-100";

        return (
          <button
            key={item.path}
            type="button"
            onClick={() => handleNavigation(item.path)}
            title={!isExpanded ? item.label : undefined}
            className={`group relative flex w-full items-center rounded-xl transition-[opacity,transform,background-color,color] duration-300 ease-out ${
              isExpanded ? "gap-3 px-3 py-2.5" : "justify-center px-2 py-3"
            } ${itemAnimationClass} ${
              active
                ? "bg-white/[0.09] text-white"
                : "text-[#71717A] hover:bg-white/[0.045] hover:text-[#D4D4D8]"
            }`}
            style={
              stagger && isExpanded
                ? { transitionDelay: `${320 + index * 55}ms` }
                : undefined
            }
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

  const creditsSection = (isExpanded) => (
    <div
      className={`transition-[opacity,transform] duration-300 ease-out ${
        isExpanded ? "translate-x-0 opacity-100" : "translate-x-0 opacity-100"
      }`}
    >
      {isExpanded ? (
        <div className="flex w-full items-center justify-between px-3 py-2.5">
          <div className="flex  items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.045] text-[#A1A1AA]">
              <FiCreditCard size={18} strokeWidth={1.7} />
            </div>

            <div className=" min-w-0 flex-1 ">
              <span className="block text-[10px] uppercase tracking-[0.16em] text-[#71717A]">
                Credits
              </span>

              <span className="mt-0.5 block text-[13px] font-semibold text-[#E4E4E7]">
                {credits}
                {" INR"}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-white/80 transition-colors hover:bg-white/[0.12]"
          >
            <FiPlusCircle size={18} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          title={`${credits} Credits`}
          aria-label={`${credits} Credits`}
          className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-[#A1A1AA] transition-[background-color,color,transform] duration-200 hover:bg-white/[0.06] hover:text-white"
        >
          <FiCreditCard size={16} strokeWidth={1.7} />
        </button>
      )}
    </div>
  );

  const userSection = (isExpanded) => (
    <div className="shrink-0 border-t border-white/[0.08] p-3">
      <div className="relative h-[62px]">
        <div
          className={`absolute inset-0 transition-[opacity,transform] duration-300 ease-out ${
            isExpanded
              ? "translate-x-0 opacity-100 delay-[320ms]"
              : "pointer-events-none -translate-x-2 opacity-0"
          }`}
        >
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-[#17191C]">
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold leading-tight text-[#A1A1AA]">
                  {firstName}
                </span>

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
        </div>

        <div
          className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-300 ease-out ${
            isExpanded
              ? "pointer-events-none translate-x-2 opacity-0"
              : "translate-x-0 opacity-100 delay-[320ms]"
          }`}
        >
          <button
            type="button"
            onClick={() => handleNavigation("/profile")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xs font-bold text-[#17191C]"
            title={firstName}
          >
            {initials}
          </button>
        </div>
      </div>
    </div>
  );

  const sidebarBottom = (isExpanded) => (
    <div className="shrink-0">
      {/* Mobile: User → Credits */}
      <div className="md:hidden">
        <div className="px-3 pb-3">{creditsSection(isExpanded)}</div>
        {userSection(isExpanded)}
      </div>

      {/* Desktop: Credits → User */}
      <div className="hidden md:block">
        <div className=" p-3 pb-2">{creditsSection(isExpanded)}</div>
        {userSection(isExpanded)}
      </div>
    </div>
  );

  const sidebarContent = (
    isExpanded,
    showDesktopToggle = true,
    animateDesktopContent = false,
  ) => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div
        className={`flex h-[72px] shrink-0 items-center border-b border-white/[0.08] ${
          isExpanded ? "justify-between px-4" : "justify-between px-2"
        }`}
      >
        {brand(isExpanded, animateDesktopContent)}

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
      <div className="relative mt-6 min-h-0 flex-1 overflow-hidden px-2">
        <div
          className={
            animateDesktopContent && isExpanded
              ? "transition-opacity duration-300 opacity-100"
              : animateDesktopContent
                ? "pointer-events-none opacity-0"
                : "opacity-100"
          }
        >
          {isExpanded && (
            <p
              className={
                animateDesktopContent
                  ? "px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#52525B] transition-[opacity,transform] duration-300 translate-x-0 opacity-100 delay-[280ms]"
                  : "px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#52525B]"
              }
            >
              Workspace
            </p>
          )}

          {renderNavigationItems(
            isExpanded,
            animateDesktopContent && isExpanded,
          )}

          {isExpanded && <div className="my-5 h-px bg-white/[0.07]" />}

          {isExpanded && (
            <p
              className={
                animateDesktopContent
                  ? "px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#52525B] transition-[opacity,transform] duration-300 translate-x-0 opacity-100 delay-[500ms]"
                  : "px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#52525B]"
              }
            >
              Account
            </p>
          )}

          {renderAccountItems(isExpanded, animateDesktopContent && isExpanded)}
        </div>

        {!isExpanded && (
          <div className="absolute inset-x-0 top-0">
            {renderNavigationItems(false)}
            <div className="my-5 h-px bg-white/[0.07]" />
            {renderAccountItems(false)}
          </div>
        )}
      </div>

      {/* Credits + User */}
      {sidebarBottom(isExpanded)}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 hidden h-screen shrink-0 overflow-hidden border-r border-white/[0.08] bg-[#111315] transition-[width] duration-300 md:block ${
          sidebarOpen ? "w-[250px]" : "w-[76px]"
        }`}
      >
        {sidebarContent(sidebarOpen, true, true)}
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
              data-mobile-sidebar="true"
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

                {sidebarContent(true, false, false)}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
