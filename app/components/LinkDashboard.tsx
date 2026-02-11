"use client";

import { useEffect, useMemo, useState } from "react";
import { Categories } from "../config";

const Favicon = ({ url, name }: { url: string; name: string }) => {
  const [error, setError] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  let hostname = "";
  try { hostname = new URL(url).hostname; } catch (e) { }

  const iconSources = useMemo(
    () => hostname
      ? [
        `/api/favicon?domain=${encodeURIComponent(hostname)}&size=64`,
        `https://icons.duckduckgo.com/ip3/${encodeURIComponent(hostname)}.ico`,
      ]
      : [],
    [hostname]
  );

  useEffect(() => {
    setError(false);
    setSourceIndex(0);
  }, [url]);

  const iconUrl = iconSources[sourceIndex];

  const handleImageError = () => {
    if (sourceIndex < iconSources.length - 1) {
      setSourceIndex((previous) => previous + 1);
      return;
    }
    setError(true);
  };

  return (
    <div className="w-14 h-14 rounded-2xl liquid-panel liquid-chrome flex items-center justify-center overflow-hidden shrink-0 transition-transform duration-500 group-hover:scale-[1.06]">
      {!error && hostname && iconUrl ? (
        <img
          src={iconUrl}
          alt={name}
          className="w-8 h-8 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
          onError={handleImageError}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="text-xl font-medium text-slate-500/80 dark:text-slate-300/75">{name[0]}</span>
      )}
    </div>
  );
};

export default function LinkDashboard() {
  const categories = Object.keys(Categories);
  const [activeCat, setActiveCat] = useState(categories[0]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 mt-1">
      <nav className="liquid-panel liquid-chrome liquid-pill liquid-ring flex justify-center flex-wrap gap-2 px-3 py-2 mx-auto relative z-20">
        {categories.map((cat) => {
          const isActive = activeCat === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`
                relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 z-10 border
                ${isActive
                  ? "text-slate-900 dark:text-white bg-white/90 dark:bg-slate-700/80 border-white/90 dark:border-slate-400/40 shadow-[0_6px_16px_-10px_rgba(15,23,42,0.65)]"
                  : "text-slate-500 dark:text-slate-300 border-transparent hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/45 dark:hover:bg-slate-700/45"}
              `}
            >
              {cat}
            </button>
          );
        })}
      </nav>

      <div className="min-h-[300px] w-full px-1 sm:px-2">
        <div key={activeCat} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {Categories[activeCat]?.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group relative flex flex-col items-center p-5 gap-3 liquid-card
                liquid-panel
                transition-transform duration-200
                hover:-translate-y-1
              "
            >
              <Favicon url={link.url} name={link.name} />
              <div className="flex flex-col items-center text-center min-w-0 w-full z-10">
                <span className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate w-full">
                  {link.name}
                </span>
                {link.desc && (
                  <span className="text-[10px] liquid-text-muted truncate w-full mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
