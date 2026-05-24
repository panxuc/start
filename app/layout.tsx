import type { Metadata } from "next";
import { Noto_Serif_SC } from "next/font/google";
import ErrorBoundary from "./components/ErrorBoundary";
import ThemeProvider from "./components/ThemeProvider";
import { loadSiteSettings } from "./lib/site-settings-store";
import "./globals.css";

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif-sc",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await loadSiteSettings();
  return {
    title: settings.siteName,
    description: "一页纸式网址导航",
    icons: {
      icon: settings.faviconUrl || "/favicon.ico",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${notoSerifSC.variable} min-h-screen font-serif antialiased`}>
        <ThemeProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
