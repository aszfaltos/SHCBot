"use client";

import { useEffect, useState } from "react";
import { applyTheme, getInitialTheme, setTheme, Theme } from "@/lib/theme";

export default function ThemeSelector() {
  const [theme, setThemeState] = useState<Theme | null>(null);

  useEffect(() => {
    const initial = getInitialTheme();
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value as Theme;
    setThemeState(newTheme);
    setTheme(newTheme);
  };

  if (theme === null) return null; // Avoid SSR/client mismatch

  return (
    <select
      value={theme}
      onChange={handleChange}
      className="px-2 py-1 rounded-lg bg-gray-200 group-hover:bg-gray-100 dark:bg-gray-950 dark:group-hover:bg-gray-900"
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}
