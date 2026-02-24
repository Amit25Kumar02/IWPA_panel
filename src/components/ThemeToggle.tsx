"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  // Read saved theme on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // const initial = stored ?? (prefersDark ? "dark" : "light");
      const initial = stored ?? "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const applyTheme = (next: Theme) => {
    const root = document.documentElement;

    if (next === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", next);
  };

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="w-full flex items-center cursor-pointer justify-between gap-2 rounded-lg  bg-sidebar-accent px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-border transition"
    >
      <span className="flex gap-2 items-center">
      {theme === "dark" ? (
        <Sun className="w-6 h-6" />
      ) : (
        <Moon className="w-6 h-6" />
      )}
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
}
