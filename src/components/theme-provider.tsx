"use client";

import { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
});

const STORAGE_KEY = "moneymap-theme";

function getSystemDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") return getSystemDark() ? "dark" : "light";
  return theme;
}

function applyToDOM(theme: Theme) {
  if (typeof document === "undefined") return;
  const isDark = resolveTheme(theme) === "dark";
  document.documentElement.classList.toggle("dark", isDark);
}

function readStorage(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem(STORAGE_KEY) as Theme) ?? "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeRaw] = useState<Theme>("system");
  const initialized = useRef(false);

  // Read localStorage once on mount (not during render)
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const stored = readStorage();
      setThemeRaw(stored);
      applyToDOM(stored);
    }
  }, []);

  // Sync DOM whenever theme changes
  useEffect(() => {
    applyToDOM(theme);
  }, [theme]);

  const resolved = resolveTheme(theme);

  const setTheme = useCallback((t: Theme) => {
    setThemeRaw(t);
    localStorage.setItem(STORAGE_KEY, t);
    applyToDOM(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme: resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
