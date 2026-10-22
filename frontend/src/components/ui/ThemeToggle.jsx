import { FiMoon } from "react-icons/fi";
import { useTheme } from "../../app/providers/useTheme.js";

export default function ThemeToggle() {
  const { theme } = useTheme();

  return (
    <button
      type="button"
      disabled
      aria-label="Dark theme enabled"
      title="Dark theme enabled"
      className={[
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
        "border transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
        "border-white/20 bg-zinc-900 text-zinc-100",
      ].join(" ")}
    >
      <FiMoon aria-hidden="true" size={17} />
    </button>
  );
}
