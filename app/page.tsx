import ThemeToggle from "./components/ThemeToggle";
import SearchWidget from "./components/SearchWidget";
import LinkDashboard from "./components/LinkDashboard";
import Link from "next/link";
import { loadSiteSettings } from "./lib/site-settings";

export default async function Home() {
  const { settings } = await loadSiteSettings();
  const copyrightText = settings.copyrightText?.trim() || `© ${new Date().getFullYear()}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── MD3 Top App Bar (Small, Center-aligned) ── */}
      <header className="sticky top-0 z-50 bg-md-surface">
        <div className="max-w-[840px] mx-auto px-16dp sm:px-24dp h-16 flex items-center justify-between">
          <h1 className="text-[1.375rem] font-normal leading-7 text-md-on-surface">
            {settings.siteName}
          </h1>
          <div className="flex items-center gap-8dp">
            <Link
              href="/admin"
              className="md3-state-layer inline-flex items-center justify-center h-10 px-24dp rounded-md3-full text-[0.875rem] font-medium tracking-[0.1px] text-md-primary border border-md-outline transition-colors duration-md3-s4 ease-md3-standard"
            >
              Admin
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <div className="h-px bg-md-surface-container-highest" />
      </header>

      {/* ── Main content area (surface-container-low) ── */}
      <main className="flex-1 bg-md-surface-container-low flex flex-col items-center px-16dp sm:px-24dp py-32dp sm:py-48dp gap-32dp sm:gap-48dp">
        <div className="w-full max-w-[600px]">
          <SearchWidget />
        </div>
        <div className="w-full">
          <LinkDashboard />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-md-surface">
        <div className="h-px bg-md-surface-container-highest" />
        <div className="max-w-[840px] mx-auto px-16dp sm:px-24dp py-24dp flex flex-col items-center gap-4dp">
          <p className="text-[0.75rem] font-normal tracking-[0.4px] text-md-on-surface-variant">{copyrightText}</p>
          {settings.beianText && (
            <a
              href={settings.beianUrl || "https://beian.miit.gov.cn/"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.75rem] tracking-[0.4px] text-md-on-surface-variant hover:text-md-on-surface transition-colors"
            >
              {settings.beianText}
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
