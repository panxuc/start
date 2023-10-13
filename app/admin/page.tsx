import AdminNavigationManager from "../components/AdminNavigationManager";
import ThemeToggle from "../components/ThemeToggle";
import Link from "next/link";
import { loadSiteSettings } from "../lib/site-settings";

export default async function AdminPage() {
  const { settings } = await loadSiteSettings();
  return (
    <main className="liquid-page min-h-screen flex flex-col transition-colors">
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/92 dark:bg-zinc-900/92 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              首页
            </Link>
            <h1 className="text-sm sm:text-base font-semibold text-zinc-700 dark:text-zinc-200">
              {settings.siteName} / Admin
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 w-full px-4 md:px-8 py-5 md:py-6 flex flex-col gap-4">
        <AdminNavigationManager />
      </div>
    </main>
  );
}
