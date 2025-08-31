'use client';

import { useDarkMode } from '../hooks/useDarkMode';

export default function DarkModeProvider({ children }: { children: React.ReactNode }) {
  useDarkMode();
  return <>{children}</>;
}