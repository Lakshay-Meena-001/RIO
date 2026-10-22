import React from "react";

/* Structural wrapper only: App.jsx continues to own routing and page state. */
export default function AppShell({ sidebar, mobileHeader, mobileBottomBar, children, className = "", mainClassName = "" }) {
  return <div className={`rio-app-shell ${className}`.trim()}>{sidebar}{mobileHeader}<div className={`rio-app-shell__main ${mainClassName}`.trim()}>{children}</div>{mobileBottomBar}</div>;
}
