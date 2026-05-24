"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const themeOptions = [
  { value: "system", label: "跟随系统", Icon: Monitor },
  { value: "light", label: "浅色模式", Icon: Sun },
  { value: "dark", label: "深色模式", Icon: Moon },
] as const;

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? theme || "system" : "system";

  return (
    <div
      className="inline-flex shrink-0 rounded-md border border-paper-border bg-ivory/70 p-0.5"
      role="group"
      aria-label="主题"
    >
      {themeOptions.map(({ value, label, Icon }) => {
        const isActive = activeTheme === value;
        const currentLabel =
          value === "system" && mounted
            ? `${label}，当前${resolvedTheme === "dark" ? "深色" : "浅色"}`
            : label;

        return (
          <button
            key={value}
            type="button"
            aria-label={currentLabel}
            aria-pressed={mounted ? isActive : undefined}
            title={currentLabel}
            className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${
              isActive
                ? "bg-ink text-ivory"
                : "text-stone hover:bg-ink-tint hover:text-ink"
            }`}
            onClick={() => setTheme(value)}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
