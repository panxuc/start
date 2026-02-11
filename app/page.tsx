import ThemeToggle from "./components/ThemeToggle";
import SearchWidget from "./components/SearchWidget";
import LinkDashboard from "./components/LinkDashboard";

export default function Home() {
  return (
    <main className="liquid-page min-h-screen relative overflow-hidden flex flex-col transition-colors duration-500">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="liquid-orb liquid-orb-1"></div>
        <div className="liquid-orb liquid-orb-2"></div>
        <div className="liquid-orb liquid-orb-3"></div>
      </div>

      <header className="w-full p-5 md:p-7 flex justify-end z-50">
        <ThemeToggle />
      </header>

      <div className="flex-1 w-full px-4 md:px-8 pt-8 md:pt-10 pb-16 md:pb-20 flex flex-col items-center gap-10">
        <div className="w-full max-w-3xl relative z-50">
          <SearchWidget />
        </div>
        <LinkDashboard />
      </div>
      
      <footer className="w-full pb-8 md:pb-10 flex flex-col items-center gap-2 text-xs font-medium liquid-text-muted opacity-90">
        <p>© {new Date().getFullYear()} Xuc Pan</p>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          京ICP备2025135198号-2
        </a>
      </footer>
    </main>
  );
}
