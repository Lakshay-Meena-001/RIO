export default function PageContainer({
  as: Component = "main",
  children,
  className = "",
  contentClassName = "",
  ...props
}) {
  return (
    <Component className={`rio-page-container ${className}`.trim()} {...props}>
      <div className={`rio-page-content ${contentClassName}`.trim()}>
        {children}
      </div>
    </Component>
  );
}
