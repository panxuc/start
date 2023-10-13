import ThemeToggle from "./components/ThemeToggle";
import SearchWidget from "./components/SearchWidget";
import LinkDashboard from "./components/LinkDashboard";
import Link from "next/link";
import { loadSiteSettings } from "./lib/site-settings";

export default async function Home() {
  const { settings } = await loadSiteSettings();
  const copyrightText = settings.copyrightText?.trim() || `© ${new Date().getFullYear()}`;
  return (
    <main className="liquid-page min-h-screen flex flex-col transition-colors duration-300">
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/92 dark:bg-zinc-900/92 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="font-semibold text-[15px] tracking-tight">{settings.siteName}</div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-sm px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Admin
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 w-full px-4 md:px-8 pt-8 md:pt-10 pb-16 md:pb-20 flex flex-col items-center gap-8">
        <div className="w-full max-w-3xl">
          <SearchWidget />
        </div>
        <div className="w-full max-w-6xl">
          <LinkDashboard />
        </div>
      </div>
      
      <footer className="w-full py-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-2 text-xs font-medium liquid-text-muted">
        <p>{copyrightText}</p>
        {settings.beianText && (
          <a
            href={settings.beianUrl || "https://beian.miit.gov.cn/"}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {settings.beianText}
          </a>
        )}
      </footer>
    </main>
  );
}
