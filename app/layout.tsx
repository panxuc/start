import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import DarkModeProvider from "./components/DarkModeProvider";
import "./globals.css";

const notoSansSC = Noto_Sans_SC({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xuc Start",
  description: "Xuc Pan 提供的网址导航",
};

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
      <body className={`${notoSansSC.className} min-h-screen flex flex-col bg-[#F8F9FB] dark:bg-gray-900 transition-colors duration-300`}>
        <DarkModeProvider>
          {children}
        </DarkModeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
