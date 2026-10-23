import { useCallback, useEffect, useMemo, useState } from "react";

import { ThemeContext } from "./themeContext.js";

const THEME_STORAGE_KEY = "rio-theme";
const VALID_THEMES = new Set(["dark"]);

function getInitialTheme() {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return VALID_THEMES.has(savedTheme) ? savedTheme : "dark";
  } catch {
    return "dark";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.style.colorScheme = "dark";

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    } catch {
      // Theme remains usable when browser storage is unavailable.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme("dark");
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
