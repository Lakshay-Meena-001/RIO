const surfaceBackgrounds = {
  default:
    "radial-gradient(ellipse 75% 85% at 100% 0%, rgba(255,255,255,0.055), transparent 68%), linear-gradient(135deg, rgba(255,255,255,0.02), transparent 48%)",
  scorer:
    "radial-gradient(ellipse 70% 95% at 100% 0%, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.02) 38%, transparent 70%), linear-gradient(135deg, rgba(255,255,255,0.02), transparent 48%)",
  roadmap:
    "radial-gradient(ellipse 70% 95% at 100% 0%, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.025) 38%, transparent 70%), linear-gradient(135deg, rgba(255,255,255,0.025), transparent 48%)",
};

export default function Surface({
  children,
  className = "",
  variant = "default",
  as: Component = "section",
  contentClassName = "",
}) {
  const background = surfaceBackgrounds[variant] || surfaceBackgrounds.default;
  return (
    <Component
      className={`rio-surface relative overflow-hidden rounded-[22px] border border-white/[0.10] bg-[#111315] ${className}`.trim()}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background }}
      />
      <div className={`relative ${contentClassName}`.trim()}>{children}</div>
    </Component>
  );
}
