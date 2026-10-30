export default function ProgressBar({ value = 0, className = "" }) {
  const percentage = Number.isFinite(Number(value))
    ? Math.max(0, Math.min(100, Number(value)))
    : 0;

  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-white/[.08] ${className}`}>
      <div
        className="h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none"
        style={{
          width: `${percentage}%`,
          background: "linear-gradient(90deg, #D4D4D8, #FFFFFF)",
        }}
      />
    </div>
  );
}
