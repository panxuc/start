"use client";

import { useEffect, useMemo, useState } from "react";
import { Categories, type CategoryMap } from "../config";

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
    <div className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 transition-transform duration-200 group-hover:scale-[1.03]">
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
        <span className="text-base font-medium text-zinc-500 dark:text-zinc-300">{name[0]}</span>
      )}
    </div>
  );
};

export default function LinkDashboard() {
  const [categoryMap, setCategoryMap] = useState<CategoryMap>(Categories);
  const categories = Object.keys(categoryMap);
  const [activeCat, setActiveCat] = useState(categories[0] || "");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/navigation", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const nextCategories = data?.categories;
        if (!nextCategories || typeof nextCategories !== "object") {
          return;
        }

        const names = Object.keys(nextCategories);
        if (names.length === 0) {
          return;
        }

        setCategoryMap(nextCategories as CategoryMap);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!categories.length) {
      if (activeCat) {
        setActiveCat("");
      }
      return;
    }

    if (!activeCat || !categoryMap[activeCat]) {
      setActiveCat(categories[0]);
    }
  }, [activeCat, categories, categoryMap]);

  if (!categories.length || !activeCat) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 mt-1">
      <nav className="liquid-panel liquid-ring flex justify-center flex-wrap gap-1.5 p-1.5 mx-auto rounded-lg">
        {categories.map((cat) => {
          const isActive = activeCat === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`
                relative px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 z-10 border
                ${isActive
                  ? "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700/50"
                  : "text-zinc-600 dark:text-zinc-300 border-transparent hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"}
              `}
            >
              {cat}
            </button>
          );
        })}
      </nav>

      <div className="min-h-[300px] w-full">
        <div key={activeCat} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {categoryMap[activeCat]?.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group relative flex flex-col items-center p-4 gap-3 liquid-card
                border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900
                transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-0.5 hover:shadow-sm
              "
            >
              <Favicon url={link.url} name={link.name} />
              <div className="flex flex-col items-center text-center min-w-0 w-full z-10">
                <span className="font-medium text-sm text-zinc-700 dark:text-zinc-200 truncate w-full">
                  {link.name}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
