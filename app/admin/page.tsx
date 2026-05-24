import Link from "next/link";
import AdminNavigationManager from "../components/AdminNavigationManager";
import ThemeToggle from "../components/ThemeToggle";
import { loadSiteSettings } from "../lib/site-settings-store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { settings } = await loadSiteSettings();

  return (
    <div className="min-h-screen">
      <header className="border-b border-paper-border-soft bg-ivory/55">
        <div className="paper-shell flex min-h-16 items-center justify-between gap-4 py-4">
          <div className="min-w-0">
            <Link className="text-sm font-medium text-ink hover:text-ink-light" href="/">
              首页
            </Link>
            <h1 className="mt-1 truncate text-xl font-semibold leading-tight text-near-black">
              {settings.siteName} / Admin
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="paper-shell py-8">
        <AdminNavigationManager />
      </main>
    </div>
  );
}
