import ThemeToggle from "./components/ThemeToggle";
import SearchWidget from "./components/SearchWidget";
import LinkDashboard from "./components/LinkDashboard";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col transition-colors duration-500 bg-zinc-100 dark:bg-[#050505]">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-500/40 dark:bg-blue-600/20 rounded-full blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/40 dark:bg-purple-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-pink-400/40 dark:bg-pink-600/20 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
      </div>

      <header className="w-full p-6 flex justify-end z-50">
        <ThemeToggle />
      </header>

      <div className="flex-1 w-full px-4 md:px-8 pt-12 pb-20 flex flex-col items-center gap-12">
        <div className="w-full max-w-3xl animate-float relative z-50">
          <SearchWidget />
        </div>
        <LinkDashboard />
      </div>
      
      <footer className="w-full py-8 flex flex-col items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium opacity-80">
        <p>© {new Date().getFullYear()} Xuc Pan</p>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          京ICP备2025135198号-2
        </a>
      </footer>
    </main>
  );
}
