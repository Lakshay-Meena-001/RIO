import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

const STORAGE_KEY = "rio-theme-preference";

function getInitialTheme() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "dark";
  } catch {
    return "dark";
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.rioTheme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Theme still works for the current session if storage is unavailable.
    }
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? FiSun : FiMoon;

  return (
    <button
      type="button"
      className="rio-theme-toggle"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
    >
      <Icon aria-hidden="true" size={16} />
      <span>{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
