"use client";

import { useState, useRef, useEffect } from "react";
import { SearchEngines } from "../config";

export default function SearchWidget() {
  const [query, setQuery] = useState("");
  const [activeEngine, setActiveEngine] = useState(SearchEngines[0]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (value: string) => {
    if (!value) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/suggestions/bing?query=${encodeURIComponent(value)}`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (e) {
      setSuggestions([]);
    }
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

  return (
    <div className="w-full max-w-3xl mx-auto relative z-30 flex flex-col items-center">
      <div className="flex gap-4 mb-4">
        {SearchEngines.map((engine) => (
          <button
            key={engine.name}
            onClick={() => setActiveEngine(engine)}
            className={`
              text-sm font-medium transition-colors duration-300
              ${activeEngine.name === engine.name
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}
            `}
          >
            {engine.name}
          </button>
        ))}
      </div>

      <div
        className={`
          relative w-full transition-all duration-300 ease-out
          ${isFocused ? "scale-105" : "scale-100"}
        `}
      >
        <form onSubmit={handleSearch} className="relative group">
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-30 transition duration-500 blur-md ${isFocused ? 'opacity-50' : ''}`}></div>

          <input
            type="text"
            value={query}
            onChange={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={`Search with ${activeEngine.name}...`}
            className="
              relative w-full h-14 pl-8 pr-16 rounded-full
              bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl
              border border-white/20 dark:border-white/10
              text-gray-800 dark:text-gray-100 placeholder-gray-400
              focus:outline-none focus:bg-white dark:focus:bg-black
              shadow-xl shadow-purple-500/5
              transition-all text-lg
            "
          />
          <button
            type="submit"
            className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all shadow-md active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </form>

        {isFocused && suggestions.length > 0 && (
          <div className="absolute top-full left-4 right-4 mt-2 py-3 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top">
            {suggestions.slice(0, 6).map((s, i) => (
              <div
                key={i}
                onClick={() => {
                  setQuery(s);
                  handleSearch(undefined, s);
                }}
                className="px-6 py-2.5 hover:bg-purple-50 dark:hover:bg-white/10 cursor-pointer text-gray-700 dark:text-gray-200 flex items-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4 text-purple-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
