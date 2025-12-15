import ThemeToggle from "./components/ThemeToggle";
import SearchWidget from "./components/SearchWidget";
import LinkDashboard from "./components/LinkDashboard";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-x-hidden flex flex-col bg-gray-50 dark:bg-black transition-colors duration-500">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-pink-400/20 dark:bg-blue-900/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <header className="w-full p-6 flex justify-end z-50">
        <ThemeToggle />
      </header>

      <div className="flex-1 w-full px-4 md:px-8 pt-10 pb-20 flex flex-col items-center">
        <SearchWidget />
        <LinkDashboard />
      </div>
      <footer className="w-full py-8 flex flex-col items-center gap-2 text-xs text-gray-400/60 dark:text-gray-600/60">
        <p>© {new Date().getFullYear()} Xuc Pan</p>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-500 dark:hover:text-gray-500 transition-colors"
        >
          京ICP备2025135198号-2
        </a>
      </footer>
    </main>
  );
}
