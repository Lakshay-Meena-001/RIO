import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getCurrentUser, logoutUser } from "../../api/user/user.api.js";
import ConfirmDialog from "../ui/ConfirmDialog.jsx";
import SidebarPanel from "./SidebarPanel.jsx";
import { navigationItems, accountItems } from "./sidebarNavigationConfig.js";

// Share the in-flight refresh across Sidebar remounts so route changes do not
// generate duplicate /me requests.
let userRefreshPromise = null;
let userLastRefreshAt = 0;
let userLastRefreshId = null;
let refreshAgainAfterCurrent = false;
const USER_REFRESH_TTL_MS = 15_000;
const SWIPE_THRESHOLD_PX = 60;

function getUserId(user) {
  return user?.userId || user?._id || user?.id || user?.email || null;
}

function normalizeUserResponse(response) {
  return response?.user || response?.data?.user || response?.data || null;
}

function Sidebar({
  user,
  setUser,
  mobileOpen = false,
  setMobileOpen,
  sidebarOpen = true,
  setSidebarOpen,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const sidebarUserId = getUserId(user);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMobileOpen?.(false);
    };

    const preventBackgroundScroll = (event) => {
      const target = event.target;
      if (
        !(target instanceof Element) ||
        !target.closest('[data-mobile-sidebar="true"]')
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("touchmove", preventBackgroundScroll, {
      passive: false,
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("touchmove", preventBackgroundScroll);
    };
  }, [mobileOpen, setMobileOpen]);

  useEffect(() => {
    let active = true;

    const refreshUser = async ({ force = false } = {}) => {
      if (!force && document.visibilityState === "hidden") return;
      if (
        !force &&
        userLastRefreshId === sidebarUserId &&
        Date.now() - userLastRefreshAt < USER_REFRESH_TTL_MS
      ) {
        return;
      }

      if (userRefreshPromise) {
        if (force) refreshAgainAfterCurrent = true;
        const pending = userRefreshPromise;
        const freshUser = await pending;
        const freshUserId = getUserId(freshUser);
        const sameAccount =
          !sidebarUserId || !freshUserId || sidebarUserId === freshUserId;

        if (active && freshUser && sameAccount) {
          setUser?.((current) => ({ ...(current || {}), ...freshUser }));
          userLastRefreshAt = Date.now();
          userLastRefreshId = sidebarUserId;
        }

        if (force && refreshAgainAfterCurrent) {
          refreshAgainAfterCurrent = false;
          return refreshUser({ force: true });
        }
        return;
      }

      const request = getCurrentUser()
        .then(normalizeUserResponse)
        .catch(() => null)
        .finally(() => {
          if (userRefreshPromise === request) userRefreshPromise = null;
        });

      userRefreshPromise = request;
      const freshUser = await request;
      const freshUserId = getUserId(freshUser);
      const sameAccount =
        !sidebarUserId || !freshUserId || sidebarUserId === freshUserId;

      if (active && freshUser && sameAccount) {
        setUser?.((current) => ({ ...(current || {}), ...freshUser }));
        userLastRefreshAt = Date.now();
        userLastRefreshId = sidebarUserId;
      }
    };

    const handleFocus = () => void refreshUser();
    const handleBalanceUpdate = () => void refreshUser({ force: true });
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshUser();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("rio:balance-updated", handleBalanceUpdate);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("rio:balance-updated", handleBalanceUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [setUser, sidebarUserId]);

  const firstName = user?.name?.trim().split(/\s+/)[0] || "User";
  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";
  const balance = Number(user?.balance ?? 0);

  const isActive = useCallback(
    (path) => {
      if (path === "/dashboard") return location.pathname === path;
      if (path === "/builder/dashboard") {
        return location.pathname === path || location.pathname === "/builder";
      }
      return (
        location.pathname === path || location.pathname.startsWith(`${path}/`)
      );
    },
    [location.pathname],
  );

  const handleNavigation = useCallback(
    (path) => {
      navigate(path);
      setMobileOpen?.(false);
    },
    [navigate, setMobileOpen],
  );

  const handleLogout = useCallback(() => {
    setMobileOpen?.(false);
    setLogoutConfirmOpen(true);
  }, [setMobileOpen]);

  const confirmLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try {
      await logoutUser();
      setLogoutConfirmOpen(false);
      setUser?.(null);
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

  const toggleDesktopSidebar = () => {
    setSidebarOpen?.((current) => {
      const next = !current;
      try {
        window.localStorage.setItem("rio-sidebar-open", String(next));
      } catch {
        // Sidebar still works when browser storage is unavailable.
      }
      return next;
    });
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches?.[0]?.clientX ?? null;
  };

  const handleMobileTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches?.[0]?.clientX;
    if (
      typeof endX === "number" &&
      endX - touchStartX.current < -SWIPE_THRESHOLD_PX
    ) {
      setMobileOpen?.(false);
    }
    touchStartX.current = null;
  };

  const handleEdgeTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches?.[0]?.clientX;
    if (
      typeof endX === "number" &&
      endX - touchStartX.current > SWIPE_THRESHOLD_PX
    ) {
      setMobileOpen?.(true);
    }
    touchStartX.current = null;
  };

  const panelProps = {
    user,
    firstName,
    initials,
    balance,
    navigationItems,
    accountItems,
    isActive,
    onNavigate: handleNavigation,
    onLogout: handleLogout,
  };

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

      <aside
        id="rio-desktop-sidebar"
        aria-label="Main sidebar"
        className={`fixed inset-y-0 left-0 z-40 hidden h-[100dvh] max-h-[100dvh] overflow-hidden border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] shadow-[var(--shadow-lg)] transition-[width] duration-200 ease-out motion-reduce:transition-none md:block ${
          sidebarOpen ? "w-[250px]" : "w-[76px]"
        }`}
      >
        <SidebarPanel
          {...panelProps}
          expanded={sidebarOpen}
          showDesktopToggle
          onToggle={toggleDesktopSidebar}
        />
      </aside>

      {!mobileOpen && (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleEdgeTouchEnd}
          className="fixed inset-y-0 left-0 z-30 w-3 touch-pan-y md:hidden"
          aria-hidden="true"
        />
      )}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {mobileOpen && (
              <>
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  onClick={() => setMobileOpen?.(false)}
                  className="fixed inset-0 z-[60] cursor-default bg-black/45 backdrop-blur-md md:hidden motion-reduce:transition-none"
                  aria-label="Close navigation"
                />
                <motion.aside
                  id="rio-mobile-sidebar"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Main navigation"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{
                    type: "tween",
                    duration: 0.22,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleMobileTouchEnd}
                  data-mobile-sidebar="true"
                  className="fixed inset-y-0 left-0 z-[61] h-[100dvh] max-h-[100dvh] w-[min(19rem,calc(100vw-2.5rem))] overflow-hidden border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] shadow-2xl md:hidden motion-reduce:transition-none"
                >
                  <SidebarPanel {...panelProps} expanded mobile />
                </motion.aside>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

export default React.memo(Sidebar);
