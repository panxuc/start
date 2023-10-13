import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Noto_Sans_SC } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import DarkModeProvider from "./components/DarkModeProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import { loadSiteSettings } from "./lib/site-settings";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await loadSiteSettings();
  return {
    title: settings.siteName,
    description: "网址导航",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var localTheme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (localTheme === 'dark' || (!localTheme && supportDarkMode)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${roboto.variable} ${notoSansSC.variable} font-sans min-h-screen flex flex-col bg-md-background text-md-on-background antialiased`}>
        <DarkModeProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </DarkModeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
