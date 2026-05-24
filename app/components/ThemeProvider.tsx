"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="start-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
