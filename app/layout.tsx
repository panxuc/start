import type { Metadata } from "next";
import { Noto_Sans_SC, Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import DarkModeProvider from "./components/DarkModeProvider";
import { loadSiteSettings } from "./lib/site-settings";
import "./globals.css";

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
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
      <body className={`${inter.variable} ${notoSansSC.variable} font-sans min-h-screen flex flex-col bg-[#F8F9FB] dark:bg-gray-900 transition-colors duration-300`}>
        <DarkModeProvider>
          {children}
        </DarkModeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
