import React from "react";
import dynamic from "next/dynamic";
import SearchDiv from "./components/SearchDiv";
import Title from "./components/Title";
import ThemeToggle from "./components/ThemeToggle";
import { Categories } from "./config";

const TabSwitcher = dynamic(() => import("./components/TabSwitcher"), {
  loading: () => <div className="h-64 w-full animate-pulse bg-white/50 rounded-3xl"></div>
});
const Footer = dynamic(() => import("./components/Footer"));
const ExtraScript = dynamic(() => import("./components/ExtraScript"));

export default function Home() {
  return (
    <>
      <div className="fixed inset-0 bg-[#F8F9FB] dark:bg-gray-900 -z-20 transition-colors duration-300"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-purple-100/40 to-transparent dark:from-blue-900/20 dark:via-purple-900/20 -z-10"></div>
      
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <main className="min-h-screen flex flex-col items-center px-4 py-16 sm:py-20 relative overflow-x-hidden selection:bg-blue-100 dark:selection:bg-blue-900">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
          
          <div className="mb-8 scale-90 sm:scale-100 transition-transform">
            <Title />
          </div>
          
          <div className="w-full flex justify-center mb-12">
            <SearchDiv />
          </div>
          
          <div className="w-full">
            <TabSwitcher categories={Categories} />
          </div>
        </div>
        
        <div className="mt-auto pt-10">
           <Footer />
        </div>
      </main>
      
      <ExtraScript />
    </>
  );
}
