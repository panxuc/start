"use client";

import { useState } from "react";
import Categories from './components/Categories';
import SearchForm from "./components/SearchForm";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>("清华");
  return (
    <main className="flex min-h-screen flex-col items-center p-10">
      <div className="flex items-center gap-2 mb-4">
        <img src="/favicon.ico" alt="Xuc Pan" className="w-8 h-8 rounded-lg" />
        <h1 className="text-4xl font-bold">Xuc Start</h1>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <SearchForm
          actionUrl="https://www.google.com/search"
          inputName="q"
          placeholder="Google 搜索"
          buttonLabel="搜索"
        />
        <SearchForm
          actionUrl="https://www.baidu.com/s"
          inputName="wd"
          placeholder="百度搜索"
          buttonLabel="搜索"
        />
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        {Object.keys(Categories).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${selectedCategory === category
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
        {selectedCategory &&
          Categories[selectedCategory as keyof typeof Categories].map((site) => (
            <a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border border-gray-300 rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg"
            >
              <p className="text-xl mb-2">{site.name}</p>
              {/* <p className="text-sm text-gray-600">{site.desc}</p> */}
            </a>
          ))}
      </div>

      <footer className="mt-8 w-full text-center text-gray-500">
        Copyright © {new Date().getFullYear()} Xuc Pan. All Rights Reserved.
      </footer>

      <script defer src="https://analytics.panxuc.com/script.js" data-website-id="a853dab6-8e8d-4c85-95c2-0d48bb54e7e7"></script>

    </main>
  );
}
