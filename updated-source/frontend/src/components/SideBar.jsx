import React from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { getCurrentUser, logoutUser } from "../api/user/user.api.js";
import toast from "react-hot-toast";
import ConfirmDialog from "./ui/ConfirmDialog.jsx";

import {
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiFileText,
  FiHome,
  FiPlus,
  FiLogOut,
  FiMap,
  FiStar,
  FiUser,
  FiSettings,
} from "react-icons/fi";
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
  const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false);
  const [logoutLoading, setLogoutLoading] = React.useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    const preventBackgroundScroll = (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        event.preventDefault();
        return;
      }

      const sidebar = target.closest('[data-mobile-sidebar="true"]');

      // Sidebar ke bahar background scrolling completely block.
      if (!sidebar) {
        event.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventBackgroundScroll, {
      passive: false,
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;

      document.removeEventListener("touchmove", preventBackgroundScroll);
    };
  }, [mobileOpen]);

  // Keep the persistent sidebar balance in sync with server-side top-ups and scorer charges.
  useEffect(() => {
    let active = true;
    const refreshUser = async () => {
      try {
        const response = await getCurrentUser();
        const freshUser =
          response?.user || response?.data?.user || response?.data || null;
        if (active && freshUser)
          setUser?.((current) => ({ ...(current || {}), ...freshUser }));
      } catch {
        // The current page owns its own error UI; stale sidebar data is safer than a disruptive toast.
      }
    };
    const handleFocus = () => {
      void refreshUser();
    };
    const handleBalanceUpdate = () => {
      void refreshUser();
    };
    void refreshUser();
    window.addEventListener("focus", handleFocus);
    window.addEventListener("rio:balance-updated", handleBalanceUpdate);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("rio:balance-updated", handleBalanceUpdate);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [location.pathname, setUser]);

  const firstName = user?.name?.split(" ")[0] || "User";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const balance = Number(user?.balance ?? 0);

  const navigationItems = [
    {
      label: "Overview",
      icon: FiHome,
      path: "/dashboard",
    },
    {
      label: "Resume Builder",
      icon: FiFileText,
      path: "/builder/dashboard",
    },
    {
      label: "Resume Scorer",
      icon: FiStar,
      path: "/scorer",
    },
    {
      label: "Mock Interview",
      icon: FiBarChart2,
      path: "/mock-interview",
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
      label: "Billing",
      icon: FiCreditCard,
      path: "/billing",
    },
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

    if (path === "/builder/dashboard") {
      return (
        location.pathname === "/builder/dashboard" ||
        location.pathname === "/builder"
      );
    }

    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen?.(false);
  };

  const handleLogout = () => {
    // Close the mobile drawer first so the confirmation is never obscured by it.
    setMobileOpen?.(false);
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await logoutUser();
      setLogoutConfirmOpen(false);
      setUser(null);
      setMobileOpen?.(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Could not log out. Please try again.",
      );
    } finally {
      setLogoutLoading(false);
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
          className={`leading-none tracking-tight text-[var(--sidebar-text)] ${
            isExpanded ? "text-[17px]" : "text-[16px]"
          }`}
          style={{ fontFamily: '"Zen Dots", sans-serif' }}
        >
          RIO
        </div>

        <div
          className={`pointer-events-none absolute left-0 top-[calc(100%+4px)] whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.20em] text-[var(--sidebar-muted)] transition-[opacity,transform] duration-300 ease-out ${
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
            className={`group relative flex w-full items-center rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sidebar-muted-strong)] transition-[opacity,transform,background-color,color,box-shadow] duration-300 ease-out hover:shadow-sm ${
              isExpanded ? "gap-3 px-3 py-2.5" : "justify-center px-2 py-3"
            } ${itemAnimationClass} ${
              active
                ? "bg-[var(--sidebar-active)] text-[var(--sidebar-text)]"
                : "text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]"
            }`}
            style={
              stagger && isExpanded
                ? { transitionDelay: `${320 + index * 55}ms` }
                : undefined
            }
          >
            {active && (
              <span className="absolute left-0 h-5 w-[2px] rounded-full bg-[var(--sidebar-text)]" />
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
            className={`group relative flex w-full items-center rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sidebar-muted-strong)] transition-[opacity,transform,background-color,color,box-shadow] duration-300 ease-out hover:shadow-sm ${
              isExpanded ? "gap-3 px-3 py-2.5" : "justify-center px-2 py-3"
            } ${itemAnimationClass} ${
              active
                ? "bg-[var(--sidebar-active)] text-[var(--sidebar-text)]"
                : "text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]"
            }`}
            style={
              stagger && isExpanded
                ? { transitionDelay: `${320 + index * 55}ms` }
                : undefined
            }
          >
            {active && (
              <span className="absolute left-0 h-5 w-[2px] rounded-full bg-[var(--sidebar-text)]" />
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
    <div className={isExpanded ? "px-0 pb-2" : "pb-2"}>
      {isExpanded ? (
        <div className="py-0">
          <button
            type="button"
            onClick={() => handleNavigation("/billing?addBalance=1")}
            className="group flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-[var(--sidebar-hover)]"
            title="Manage your balance"
          >
            <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-[var(--sidebar-icon-bg)] text-[var(--sidebar-text)] transition-colors group-hover:bg-[var(--sidebar-icon-hover)]">
              <FiCreditCard size={19} strokeWidth={1.7} />
            </div>

            <div className="min-w-0 flex-1">
              <span className="block text-[9px] font-medium uppercase tracking-[0.13em] text-[var(--sidebar-muted-strong)]">
                Available Balance
              </span>

              <span className="mt-1 block truncate text-[15px] font-semibold leading-none tracking-tight text-[var(--sidebar-text)]">
                {balance}{" "}
                <span className="text-[11px] font-medium text-[var(--sidebar-muted-strong)]">
                  INR
                </span>
              </span>
            </div>

            <span
              className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[var(--sidebar-avatar-bg)] text-[var(--sidebar-avatar-text)] transition-transform duration-200 group-hover:scale-105"
              aria-hidden="true"
            >
              <FiPlus size={18} strokeWidth={2} />
            </span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => handleNavigation("/billing?addBalance=1")}
          title={`Available balance: ${balance} INR`}
          aria-label={`Manage balance: ${balance} INR`}
          className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sidebar-icon-bg)] text-[var(--sidebar-text)] transition-colors hover:bg-[var(--sidebar-icon-hover)]"
        >
          <FiCreditCard size={18} strokeWidth={1.7} />
        </button>
      )}
    </div>
  );

  const userSection = (isExpanded) => (
    <div className="shrink-0 border-t border-[var(--sidebar-border)] p-3">
      <div className="relative h-[62px]">
        <div
          className={`absolute inset-0 transition-[opacity,transform] duration-300 ease-out ${
            isExpanded
              ? "translate-x-0 opacity-100 delay-[320ms]"
              : "pointer-events-none -translate-x-2 opacity-0"
          }`}
        >
          <div className="rounded-2xl border border-[var(--sidebar-border)] bg-[var(--sidebar-card)] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sidebar-text)] text-xs font-bold text-[var(--sidebar-bg)]">
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold leading-tight text-[var(--sidebar-muted-strong)]">
                  {firstName}
                </span>

                <button
                  type="button"
                  onClick={() => handleNavigation("/profile")}
                  className="mt-1 block max-w-full truncate text-left text-[10px] text-[var(--sidebar-muted)] transition-colors hover:text-[var(--sidebar-text)] focus-visible:outline-none focus-visible:underline"
                  aria-label="Open profile from account email"
                  title="Open profile"
                >
                  {user?.email || "RIO member"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--sidebar-muted)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]"
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
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sidebar-text)] text-xs font-bold text-[var(--sidebar-bg)]"
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
        className={`flex h-[72px] shrink-0 items-center border-b border-[var(--sidebar-border)] ${
          isExpanded ? "justify-between px-4" : "justify-between px-2"
        }`}
      >
        {brand(isExpanded, animateDesktopContent)}

        <div className="flex shrink-0 items-center gap-1">
          {showDesktopToggle && (
            <button
              type="button"
              onClick={() => {
                setSidebarOpen((value) => {
                  const next = !value;
                  localStorage.setItem("rio-sidebar-open", String(next));
                  return next;
                });
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--sidebar-muted)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]"
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
                  ? "px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--sidebar-label)] transition-[opacity,transform] duration-300 translate-x-0 opacity-100 delay-[280ms]"
                  : "px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--sidebar-label)]"
              }
            >
              Workspace
            </p>
          )}

          {renderNavigationItems(
            isExpanded,
            animateDesktopContent && isExpanded,
          )}

          {isExpanded && (
            <div className="my-5 h-px bg-[var(--sidebar-border)]" />
          )}

          {isExpanded && (
            <p
              className={
                animateDesktopContent
                  ? "px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--sidebar-label)] transition-[opacity,transform] duration-300 translate-x-0 opacity-100 delay-[500ms]"
                  : "px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--sidebar-label)]"
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
            <div className="my-5 h-px bg-[var(--sidebar-border)]" />
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
      <ConfirmDialog
        open={logoutConfirmOpen}
        onClose={() => !logoutLoading && setLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
        title="Log out of RIO?"
        description="You can sign back in anytime to continue your career workspace."
        confirmLabel="Log out"
        loading={logoutLoading}
        variant="primary"
      />
      {/* Desktop sidebar */}
      <aside
        className={`fixed left-0 top-0 z-[9999] hidden h-screen shrink-0 overflow-hidden border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] shadow-[var(--shadow-lg)] transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:block ${
          sidebarOpen ? "w-[250px]" : "w-[76px]"
        }`}
      >
        {sidebarContent(sidebarOpen, true, true)}
      </aside>

      {/* Mobile edge swipe area */}
      {!mobileOpen && (
        <div
          onTouchStart={handleEdgeTouchStart}
          onTouchEnd={handleEdgeTouchEnd}
          className="fixed left-0 top-0 z-30 h-full w-6 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar: portal escapes dashboard stacking contexts */}
      {createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm md:hidden"
                aria-label="Close navigation"
              />

              <motion.aside
                initial={{ x: -290 }}
                animate={{ x: 0 }}
                exit={{ x: -290 }}
                transition={{
                  type: "tween",
                  duration: 0.28,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onTouchStart={handleSidebarTouchStart}
                onTouchEnd={handleSidebarTouchEnd}
                data-mobile-sidebar="true"
                className="fixed inset-y-0 left-0 z-[9999] w-[285px] border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] shadow-2xl md:hidden"
              >
                <div className="h-full">
                  {sidebarContent(true, false, false)}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

export default Sidebar;
