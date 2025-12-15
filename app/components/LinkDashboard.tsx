"use client";

import { useState } from "react";
import { Categories } from "../config";
import { motion } from "framer-motion";

const Favicon = ({ url, name }: { url: string; name: string }) => {
  const [error, setError] = useState(false);

  let hostname = "";
  try {
    hostname = new URL(url).hostname;
  } catch (e) {
    console.warn("Invalid URL:", url);
  }

  const iconUrl = `/api/favicon?domain=${hostname}`;

  return (
    <div className="w-14 h-14 rounded-[14px] bg-white/60 dark:bg-white/5 backdrop-blur-md flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-white/60 dark:border-white/10 transition-transform duration-500 group-hover:scale-105 group-hover:shadow-md">
      {!error && hostname ? (
        <img
          src={iconUrl}
          alt={name}
          className="w-8 h-8 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
          onError={() => setError(true)}
          loading="lazy"
        />
      ) : (
        <span className="text-xl font-medium text-gray-400 dark:text-gray-500">{name[0]}</span>
      )}
    </div>
  );
};

export default function LinkDashboard() {
  const categories = Object.keys(Categories);
  const [activeCat, setActiveCat] = useState(categories[0]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 animate-in fade-in duration-1000 slide-in-from-bottom-12">

      <nav className="flex justify-center flex-wrap gap-2 px-4 py-2 mx-auto rounded-full bg-white/30 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-sm">
        {categories.map((cat) => {
          const isActive = activeCat === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`
                relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-300 z-10
                ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"}
              `}
            >
              {isActive && (
                <motion.span
                  layoutId="category-bubble"
                  className="absolute inset-0 bg-white/70 dark:bg-white/10 rounded-full -z-10 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {cat}
            </button>
          );
        })}
      </nav>

      <div className="min-h-[300px] w-full">
        <div key={activeCat} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {Categories[activeCat]?.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group relative flex flex-col items-center p-5 gap-3
                bg-white/40 dark:bg-gray-800/30 backdrop-blur-xl
                border border-white/50 dark:border-white/5
                rounded-[24px] transition-all duration-300
                hover:bg-white/60 dark:hover:bg-gray-700/40
                hover:shadow-glass-hover hover:-translate-y-1.5
                hover:border-white/80 dark:hover:border-white/20
              "
            >
              <div className="absolute inset-0 rounded-[24px] bg-gradient-to-tr from-white/0 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <Favicon url={link.url} name={link.name} />

              <div className="flex flex-col items-center text-center min-w-0 w-full z-10">
                <span className="font-medium text-sm text-gray-700 dark:text-gray-200 truncate w-full group-hover:text-black dark:group-hover:text-white transition-colors">
                  {link.name}
                </span>
                {link.desc && (
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate w-full mt-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
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
