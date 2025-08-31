import React, { memo } from "react";
import dynamic from "next/dynamic";
import SearchDiv from "./components/SearchDiv";
import Title from "./components/Title";
import { Categories } from "./config";

const TabSwitcher = dynamic(() => import("./components/TabSwitcher"), {
  loading: () => <div className="h-32 animate-pulse bg-gray-200 rounded-lg"></div>
});
const Footer = dynamic(() => import("./components/Footer"));
const ExtraScript = dynamic(() => import("./components/ExtraScript"));

export default function Home() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -z-10"></div>
      <main className="flex flex-1 flex-col items-center px-6 py-12 relative">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Title />
          </div>
          <div className="flex justify-center mb-16">
            <SearchDiv />
          </div>
          <div className="w-full">
            <TabSwitcher categories={Categories} />
          </div>
        </div>
      </main>
      
      <Footer />
      <ExtraScript />
    </>
  );
}
