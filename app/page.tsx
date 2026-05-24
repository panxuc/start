import Link from "next/link";
import SearchWidget from "./components/SearchWidget";
import LinkDashboard from "./components/LinkDashboard";
import ThemeToggle from "./components/ThemeToggle";
import { loadSiteSettings } from "./lib/site-settings-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { settings } = await loadSiteSettings();
  const copyrightText = settings.copyrightText?.trim() || `© ${new Date().getFullYear()}`;

  return (
    <div className="min-h-screen">
      <header className="border-b border-paper-border-soft bg-ivory/55">
        <div className="paper-shell flex min-h-16 items-center justify-between gap-4 py-4">
          <Link href="/" className="group min-w-0">
            <h1 className="mt-1 truncate text-[1.55rem] font-semibold leading-tight text-near-black">
              {settings.siteName}
            </h1>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Link className="paper-button ghost shrink-0" href="/admin">
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="paper-shell flex flex-col gap-10 py-10 sm:py-14">
        <section className="mx-auto w-full max-w-3xl">
          <SearchWidget />
        </section>

        <LinkDashboard />
      </main>

      <footer className="border-t border-paper-border-soft">
        <div className="paper-shell flex flex-col items-center gap-1 py-6 text-center text-xs leading-relaxed text-stone">
          <p>{copyrightText}</p>
          {settings.beianText && (
            <a
              href={settings.beianUrl || "https://beian.miit.gov.cn/"}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ink"
            >
              {settings.beianText}
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
