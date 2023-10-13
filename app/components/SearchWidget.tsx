"use client";

import { useEffect, useRef, useState } from "react";
import { SearchEngines } from "../config";

export default function SearchWidget() {
  const [query, setQuery] = useState("");
  const [activeEngine, setActiveEngine] = useState(SearchEngines[0]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listboxId = "search-suggestion-listbox";
  const visibleSuggestions = suggestions.slice(0, 6);

  const fetchSuggestions = async (value: string, controller: AbortController) => {
    if (!value.trim()) {
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
      return;
    }
    try {
      const res = await fetch(`/api/suggestions/bing?query=${encodeURIComponent(value)}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      const nextSuggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
      setSuggestions(nextSuggestions);
      setActiveSuggestionIndex(-1);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    requestControllerRef.current?.abort();

    const controller = new AbortController();
    requestControllerRef.current = controller;
    debounceRef.current = setTimeout(() => fetchSuggestions(val, controller), 300);
  };

  const handleSearch = (e?: React.FormEvent, overrideQuery?: string) => {
    e?.preventDefault();
    const q = (overrideQuery ?? query).trim();
    if (!q) {
      return;
    }
    window.open(activeEngine.url + encodeURIComponent(q), "_blank", "noopener,noreferrer");
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setIsFocused(false);
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
    handleSearch(undefined, suggestion);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!visibleSuggestions.length) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev + 1) % visibleSuggestions.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev <= 0 ? visibleSuggestions.length - 1 : prev - 1));
      return;
    }

    if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      e.preventDefault();
      selectSuggestion(visibleSuggestions[activeSuggestionIndex]);
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsFocused(false);
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      requestControllerRef.current?.abort();
    };
  }, []);

  return (
    <div className="w-full relative z-30 flex flex-col items-center gap-5">
      <div
        className="liquid-panel liquid-pill liquid-ring flex p-1 rounded-lg"
      >
        {SearchEngines.map((engine) => {
          const isActive = activeEngine.name === engine.name;
          return (
            <button
              key={engine.name}
              onClick={() => setActiveEngine(engine)}
              className={`
                relative px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 z-10
                ${isActive ? "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30" : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"}
              `}
            >
              {engine.name}
            </button>
          );
        })}
      </div>

      <div className="relative w-full">
        <form onSubmit={handleSearch} className="relative group">
          <div className="liquid-panel liquid-pill liquid-ring relative flex items-center gap-2 pr-2 rounded-xl">
            <input
              type="text"
              value={query}
              onChange={handleInput}
              onFocus={() => {
                if (blurTimeoutRef.current) {
                  clearTimeout(blurTimeoutRef.current);
                }
                setIsFocused(true);
              }}
              onBlur={() => {
                blurTimeoutRef.current = setTimeout(() => {
                  setIsFocused(false);
                  setActiveSuggestionIndex(-1);
                }, 150);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder={`Search with ${activeEngine.name}...`}
              aria-label="Search input"
              aria-expanded={isFocused && visibleSuggestions.length > 0}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeSuggestionIndex >= 0 ? `${listboxId}-${activeSuggestionIndex}` : undefined}
              className="
                relative flex-1 min-w-0 h-14 pl-4 pr-2 rounded-xl
                bg-transparent border border-transparent
                text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400
                focus:outline-none
                transition-all text-[16px] font-normal
              "
            />
            <button
              type="submit"
              className="h-10 w-10 shrink-0 flex items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors active:scale-95 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </form>

        {isFocused && visibleSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 py-1.5 liquid-panel rounded-lg overflow-hidden z-40">
            <ul id={listboxId} role="listbox">
            {visibleSuggestions.map((s, i) => (
              <li key={s} id={`${listboxId}-${i}`} role="option" aria-selected={activeSuggestionIndex === i}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveSuggestionIndex(i)}
                  onClick={() => selectSuggestion(s)}
                  className={`w-full px-4 py-2.5 text-left cursor-pointer text-zinc-700 dark:text-zinc-200 flex items-center gap-3 transition-colors text-sm sm:text-base relative z-10 ${
                    activeSuggestionIndex === i ? "bg-blue-50 dark:bg-blue-900/25" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  {s}
                </button>
              </li>
            ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
