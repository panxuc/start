"use client";

import { useState } from "react";
import categories from './categories';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>("清华");
  return (
    <main className="flex min-h-screen flex-col items-center p-10">
      <div className="flex items-center gap-2 mb-4">
        <img src="/favicon.ico" alt="Xuc Pan" className="w-8 h-8 rounded-lg" />
        <h1 className="text-4xl font-bold">Xuc Start</h1>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <form action="https://www.google.com/search" method="get" target="_blank" className="flex items-center gap-2">
          <input
            type="text"
            name="q"
            placeholder="Google 搜索"
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">搜索</button>
        </form>
        <form action="https://www.baidu.com/s" method="get" target="_blank" className="flex items-center gap-2">
          <input
            type="text"
            name="wd"
            placeholder="百度搜索"
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">搜索</button>
        </form>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        {Object.keys(categories).map((category) => (
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
          categories[selectedCategory as keyof typeof categories].map((site) => (
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

    </main>
  );
}
