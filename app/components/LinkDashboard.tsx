"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Categories, type CategoryMap } from "../config";

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const Favicon = ({ url, name }: { url: string; name: string }) => {
  const [error, setError] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  let hostname = "";
  try { hostname = new URL(url).hostname; } catch {}

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
      setSourceIndex((prev) => prev + 1);
    } else {
      setError(true);
    }
  };

  return (
    <div className="w-12 h-12 rounded-md3-md bg-md-surface-container flex items-center justify-center overflow-hidden shrink-0">
      {!error && hostname && iconUrl ? (
        <img
          src={iconUrl}
          alt={name}
          className="w-7 h-7 object-contain"
          onError={handleImageError}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="text-sm font-medium text-md-on-surface-variant">{name[0]}</span>
      )}
    </div>
  );
};

/* ── Loading skeleton ── */
function Skeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-24dp">
      <div className="flex gap-8dp overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shrink-0 h-8 w-20 rounded-md3-sm bg-md-surface-container-high animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-12dp sm:gap-16dp">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center p-16dp gap-12dp rounded-md3-md bg-md-surface-container-lowest shadow-md3-1">
            <div className="w-12 h-12 rounded-md3-md bg-md-surface-container-high animate-pulse" />
            <div className="h-4 w-16 rounded bg-md-surface-container-high animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LinkDashboard() {
  const [categoryMap, setCategoryMap] = useState<CategoryMap>(Categories);
  const [loading, setLoading] = useState(true);
  const categories = Object.keys(categoryMap);
  const [activeCat, setActiveCat] = useState(categories[0] || "");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/navigation", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        const nextCategories = data?.categories;
        if (!nextCategories || typeof nextCategories !== "object") return;
        if (!Object.keys(nextCategories).length) return;
        setCategoryMap(nextCategories as CategoryMap);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (!categories.length) {
      if (activeCat) setActiveCat("");
      return;
    }
    if (!activeCat || !categoryMap[activeCat]) {
      setActiveCat(categories[0]);
    }
  }, [activeCat, categories, categoryMap]);

  if (loading) return <Skeleton />;
  if (!categories.length || !activeCat) return null;

  const links = categoryMap[activeCat] ?? [];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-24dp">
      {/* ── MD3 Filter Chips (category selector) ── */}
      <div className="flex flex-wrap gap-8dp justify-center">
        {categories.map((cat) => {
          const isActive = activeCat === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCat(cat)}
              className={`
                md3-state-layer shrink-0 h-8 px-16dp flex items-center gap-1.5
                rounded-md3-sm border text-[0.75rem] font-medium tracking-[0.5px]
                transition-all duration-md3-s4 ease-md3-standard
                ${isActive
                  ? "bg-md-secondary-container text-md-on-secondary-container border-transparent"
                  : "bg-transparent text-md-on-surface-variant border-md-outline hover:bg-md-surface-container-high"}
              `}
            >
              {isActive && (
                <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── MD3 Elevated Cards Grid ── */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCat}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ staggerChildren: 0.03, delayChildren: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-12dp sm:gap-16dp"
          >
            {links.map((link) => (
              <motion.a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                variants={cardVariants}
                transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="
                  flex flex-col items-center p-16dp gap-12dp
                  rounded-md3-md bg-md-surface-container-lowest
                  shadow-md3-1 hover:shadow-md3-2
                  transition-shadow duration-md3-s4 ease-md3-standard
                "
              >
                <Favicon url={link.url} name={link.name} />
                <span className="text-[0.875rem] font-medium text-md-on-surface truncate w-full text-center leading-tight">
                  {link.name}
                </span>
              </motion.a>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
