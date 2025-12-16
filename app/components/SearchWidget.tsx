"use client";

import { useState, useRef, useCallback } from "react";
import { SearchEngines } from "../config";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchWidget() {
  const [query, setQuery] = useState("");
  const [activeEngine, setActiveEngine] = useState(SearchEngines[0]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (value: string) => {
    if (!value) { setSuggestions([]); return; }
    try {
      const res = await fetch(`/api/suggestions/bing?query=${encodeURIComponent(value)}`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (e) { setSuggestions([]); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSearch = (e?: React.FormEvent, overrideQuery?: string) => {
    e?.preventDefault();
    const q = overrideQuery ?? query;
    if (!q) return;
    window.open(activeEngine.url + encodeURIComponent(q), "_blank");
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--spotlight-x', `${x}px`);
    e.currentTarget.style.setProperty('--spotlight-y', `${y}px`);
  }, []);

  return (
    <div className="w-full relative z-30 flex flex-col items-center">
      <div
        className="flex p-1 mb-6 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-full border border-white/30 shadow-sm relative"
      >
        {SearchEngines.map((engine) => {
          const isActive = activeEngine.name === engine.name;
          return (
            <button
              key={engine.name}
              onClick={() => setActiveEngine(engine)}
              className={`
                relative px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors duration-300 z-10
                ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="engine-bubble"
                  className="absolute inset-0 bg-white dark:bg-white/15 rounded-full shadow-sm -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {engine.name}
            </button>
          );
        })}
      </div>

      <div className={`relative w-full transition-all duration-500 ease-out transform ${isFocused ? "scale-105" : "scale-100"}`}>
        <form onSubmit={handleSearch} className="relative group">
          <div className={`absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 transition duration-500 blur-xl ${isFocused ? 'opacity-40' : ''}`}></div>

          <div
            className="relative rounded-full"
          >
            <input
              type="text"
              value={query}
              onChange={handleInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={`Search with ${activeEngine.name}...`}
              className="
                relative w-full h-16 pl-8 pr-16 rounded-full
                bg-white/60 dark:bg-black/40 backdrop-blur-2xl
                border border-white/50 dark:border-white/10
                text-gray-800 dark:text-gray-100 placeholder-gray-500/70 dark:placeholder-gray-400/70
                focus:outline-none focus:bg-white/80 dark:focus:bg-black/60
                shadow-glass focus:shadow-glass-hover
                transition-all text-lg font-light tracking-wide
                hover:border-white/70 dark:hover:border-white/30
                bg-transparent
              "
            />
            <button
              type="submit"
              className="absolute right-3 top-3 h-10 w-10 flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 rounded-full transition-all active:scale-95 z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </form>

        <AnimatePresence>
          {isFocused && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-4 right-4 mt-4 py-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl rounded-2xl border border-white/50 dark:border-white/10 shadow-glass overflow-hidden z-40"
            >
              {suggestions.slice(0, 6).map((s, i) => (
                <div
                  key={i}
                  onClick={() => { setQuery(s); handleSearch(undefined, s); }}
                  className="px-6 py-3 hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer text-gray-700 dark:text-gray-200 flex items-center gap-3 transition-colors text-sm sm:text-base relative z-10"
                >
                  <svg className="w-4 h-4 text-gray-400 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  {s}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
