"use client";

import { useTheme } from "next-themes";

import type { ReactFC } from "@/lib/types";
import { useMounted } from "@/registry/hooks/useMounted";
import { ThemeSwitchSlider } from "@/registry/new-york/theme-switch-slider/ThemeSwitchSlider";

export interface ThemeSwitchNextThemesProps {
  className?: string | undefined;
}

export const ThemeSwitchNextThemes: ReactFC<ThemeSwitchNextThemesProps> = ({
  className,
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <ThemeSwitchSlider
      theme={theme || "light"}
      setTheme={setTheme}
      isDark={isDark}
      toggleTheme={toggleTheme}
      className={className}
    />
  );
};
