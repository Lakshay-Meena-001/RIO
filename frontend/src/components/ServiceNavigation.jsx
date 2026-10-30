import MobileHeader from "./MobileHeader";
import Sidebar from "./sidebar/SideBar";

/** Shared authenticated navigation used by service pages.
 * Keeps the mobile app bar and desktop/mobile sidebar behavior consistent.
 */
export default function ServiceNavigation({
  user,
  setUser,
  mobileOpen,
  setMobileOpen,
  sidebarOpen,
  setSidebarOpen,
}) {
  return (
    <>
      <MobileHeader onOpenNavigation={() => setMobileOpen(true)} user={user} />
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        user={user}
        setUser={setUser}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
    </>
  );
}
