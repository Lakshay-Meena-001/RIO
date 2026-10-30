export function RioLogo({ compact = false }) {
  return (
    <span className="inline-flex flex-col items-center">
      <span
        className={`${compact ? "text-[17px]" : "text-[20px]"} font-bold tracking-[0.22em] text-white`}
        style={{ fontFamily: '"Zen Dots", sans-serif' }}
      >
        RIO
      </span>
      {!compact && (
        <span className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
          Career Intelligence
        </span>
      )}
    </span>
  );
}

export const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

export function SectionHeading({
  eyebrow,
  title,
  accent,
  children,
  center = true,
}) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-3xl`}>
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/[0.62]">
        {eyebrow}
      </p>
      <h2 className="text-[clamp(2.4rem,6vw,4.8rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-white">
        {title}
        {accent && (
          <span
            className="mt-2 block font-serif font-normal italic text-[#A1A1AA]"
            style={{ letterSpacing: "-0.045em" }}
          >
            {accent}
          </span>
        )}
      </h2>
      {children && (
        <p className="mt-6 text-sm leading-7 text-white/[0.62] sm:text-base">
          {children}
        </p>
      )}
    </div>
  );
}

export function GlassLine({ className = "" }) {
  return (
    <div
      className={`h-px bg-gradient-to-r from-transparent via-white/10 to-transparent ${className}`}
    />
  );
}
