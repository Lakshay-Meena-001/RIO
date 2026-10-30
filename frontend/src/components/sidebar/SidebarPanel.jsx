import React from "react";
import SidebarBrand from "./SidebarBrand.jsx";
import SidebarNavigation from "./SidebarNavigation.jsx";
import SidebarFooter from "./SidebarFooter.jsx";

function SidebarPanel({
  expanded,
  showDesktopToggle = true,
  mobile = false,
  user,
  firstName,
  initials,
  balance,
  navigationItems,
  accountItems,
  isActive,
  onNavigate,
  onToggle,
  onLogout,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <SidebarBrand
        expanded={expanded}
        showToggle={showDesktopToggle}
        onToggle={onToggle}
        onHome={() => onNavigate("/dashboard")}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-0 py-5 [scrollbar-gutter:stable]">
        <SidebarNavigation
          items={navigationItems}
          label="Workspace"
          expanded={expanded}
          isActive={isActive}
          onNavigate={onNavigate}
        />
        <div className="my-5 h-px bg-[var(--sidebar-border)]" aria-hidden="true" />
        <SidebarNavigation
          items={accountItems}
          label="Account"
          expanded={expanded}
          isActive={isActive}
          onNavigate={onNavigate}
        />
      </div>

      <SidebarFooter
        expanded={expanded}
        user={user}
        firstName={firstName}
        initials={initials}
        balance={balance}
        onNavigate={onNavigate}
        onLogout={onLogout}
        mobile={mobile}
      />
    </div>
  );
}

export default React.memo(SidebarPanel);
