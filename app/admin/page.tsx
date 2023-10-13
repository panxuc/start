import AdminNavigationManager from "../components/AdminNavigationManager";
import ThemeToggle from "../components/ThemeToggle";
import Link from "next/link";
import { loadSiteSettings } from "../lib/site-settings";

export default async function AdminPage() {
  const { settings } = await loadSiteSettings();
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── MD3 Top App Bar ── */}
      <header className="sticky top-0 z-50 bg-md-surface">
        <div className="max-w-[1040px] mx-auto px-16dp sm:px-24dp h-16 flex justify-between items-center">
          <div className="flex items-center gap-12dp">
            <Link
              href="/"
              className="md3-state-layer inline-flex items-center justify-center h-10 px-24dp rounded-md3-full text-[0.875rem] font-medium tracking-[0.1px] text-md-primary border border-md-outline transition-colors"
            >
              首页
            </Link>
            <h1 className="text-[0.875rem] sm:text-[1rem] font-medium text-md-on-surface">
              {settings.siteName} / Admin
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="h-px bg-md-surface-container-highest" />
      </header>

      {/* ── Content area ── */}
      <main className="flex-1 bg-md-surface-container-low px-16dp sm:px-24dp py-24dp">
        <div className="max-w-[1040px] mx-auto">
          <AdminNavigationManager />
        </div>
      </main>
    </div>
  );
}
