import React from "react";

export default function PageContainer({ as: Component = "main", className = "", children, ...props }) {
  return <Component className={`rio-page-container ${className}`.trim()} {...props}>{children}</Component>;
}
