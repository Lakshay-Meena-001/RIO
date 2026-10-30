export function ProfilePanel({ children, className = "" }) {
  return (
    <section className={`relative overflow-hidden rounded-[22px] border border-white/[0.09] bg-[#111315] ${className}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_85%_at_100%_0%,rgba(255,255,255,0.045),transparent_68%)]" />
      <div className="relative">{children}</div>
    </section>
  );
}

export function ProfileIconButton({ children, onClick, disabled, className = "", ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.075] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
