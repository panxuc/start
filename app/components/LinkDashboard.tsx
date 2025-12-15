"use client";

import { useState } from "react";
import { Categories } from "../config";

const Favicon = ({ url, name }: { url: string; name: string }) => {
  const [error, setError] = useState(false);
  const hostname = new URL(url).hostname;
  const iconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

  return (
    <div className="w-12 h-12 rounded-[18px] bg-white dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-gray-100 dark:border-zinc-700/50 group-hover:scale-110 transition-transform duration-300">
      {!error ? (
        <img
          src={iconUrl}
          alt={name}
          className="w-8 h-8 object-contain"
          onError={() => setError(true)}
        />
      ) : (
        <span className="text-lg font-bold text-gray-400">{name[0]}</span>
      )}
    </div>
  );
};

export default function LinkDashboard() {
  const categories = Object.keys(Categories);
  const [activeCat, setActiveCat] = useState(categories[0]);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-10 mt-16 animate-in fade-in duration-700 slide-in-from-bottom-8">

      <nav className="flex justify-center flex-wrap gap-3 px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`
              px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border
              ${activeCat === cat
                ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20 scale-105"
                : "bg-white/50 dark:bg-zinc-800/50 border-transparent hover:border-gray-200 dark:hover:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-800"}
            `}
          >
            {cat}
          </button>
        ))}
      </nav>

      <div className="min-h-[300px]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
          {Categories[activeCat]?.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group relative flex flex-col items-center p-6 gap-4
                bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md
                border border-white/60 dark:border-white/5
                rounded-3xl transition-all duration-300
                hover:bg-white dark:hover:bg-zinc-800
                hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1
              "
            >
              <Favicon url={link.url} name={link.name} />

              <div className="flex flex-col items-center text-center min-w-0 w-full">
                <span className="font-semibold text-gray-800 dark:text-gray-100 truncate w-full group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {link.name}
                </span>
                {link.desc && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full mt-1 opacity-80 group-hover:opacity-100">
                    {link.desc}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
