import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";

const notoSansSC = Noto_Sans_SC({ subsets: ['latin'] });

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
    <html lang="en">
      <body className={notoSansSC.className}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
