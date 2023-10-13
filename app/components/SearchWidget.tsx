"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      setActiveSuggestionIndex(-1);
    } catch {
      if ((arguments[0] as unknown as Error).name !== "AbortError") {
        setSuggestions([]);
        setActiveSuggestionIndex(-1);
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    debounceRef.current = setTimeout(() => fetchSuggestions(val, controller), 300);
  };

  const handleSearch = (e?: React.FormEvent, overrideQuery?: string) => {
    e?.preventDefault();
    const q = (overrideQuery ?? query).trim();
    if (!q) return;
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
    if (!visibleSuggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev + 1) % visibleSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev <= 0 ? visibleSuggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      e.preventDefault();
      selectSuggestion(visibleSuggestions[activeSuggestionIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsFocused(false);
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      requestControllerRef.current?.abort();
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-24dp">
      {/* ── MD3 Segmented Button (search engine selector) ── */}
      <div
        className="inline-flex rounded-md3-full border border-md-outline overflow-hidden"
        role="group"
        aria-label="Search engine"
      >
        {SearchEngines.map((engine, i) => {
          const isActive = activeEngine.name === engine.name;
          return (
            <button
              key={engine.name}
              type="button"
              onClick={() => setActiveEngine(engine)}
              aria-pressed={isActive}
              className={`
                md3-state-layer relative h-10 px-16dp flex items-center gap-1.5
                text-[0.875rem] font-medium tracking-[0.1px]
                transition-colors duration-md3-s4 ease-md3-standard
                ${i > 0 ? "border-l border-md-outline" : ""}
                ${isActive
                  ? "bg-md-secondary-container text-md-on-secondary-container"
                  : "text-md-on-surface"}
              `}
            >
              {isActive && (
                <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
              {engine.name}
            </button>
          );
        })}
      </div>

      {/* ── MD3 Search Bar ── */}
      <div className="relative w-full">
        <form onSubmit={handleSearch}>
          <motion.div
            animate={isFocused
              ? { boxShadow: "var(--md-sys-elevation-2)" }
              : { boxShadow: "var(--md-sys-elevation-0)" }
            }
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className={`
              flex items-center rounded-md3-xl transition-colors duration-md3-s4 ease-md3-standard
              ${isFocused ? "bg-md-surface-container-highest" : "bg-md-surface-container-high"}
            `}
          >
            {/* Leading icon */}
            <svg
              className="w-5 h-5 ml-16dp shrink-0 text-md-on-surface-variant"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            <input
              type="text"
              value={query}
              onChange={handleInput}
              onFocus={() => {
                if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
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
              className="flex-1 min-w-0 h-14 px-12dp bg-transparent text-md-on-surface placeholder:text-md-on-surface-variant focus:outline-none text-[1rem]"
            />

            {/* Trailing icon button — MD3 Filled Icon Button */}
            <button
              type="submit"
              className="md3-state-layer h-10 w-10 mr-8dp shrink-0 flex items-center justify-center rounded-md3-full bg-md-primary text-md-on-primary transition-transform active:scale-90"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </motion.div>
        </form>

        {/* ── MD3 Menu (suggestions) ── */}
        <AnimatePresence>
          {isFocused && visibleSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -4, scaleY: 0.96 }}
              transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
              style={{ transformOrigin: "top" }}
              className="absolute top-full left-0 right-0 mt-8dp py-8dp rounded-md3-md bg-md-surface-container shadow-md3-2 overflow-hidden z-40"
            >
              <ul id={listboxId} role="listbox">
                {visibleSuggestions.map((s, i) => (
                  <li key={s} id={`${listboxId}-${i}`} role="option" aria-selected={activeSuggestionIndex === i}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setActiveSuggestionIndex(i)}
                      onClick={() => selectSuggestion(s)}
                      className={`
                        w-full px-16dp py-12dp text-left flex items-center gap-12dp
                        text-[0.875rem] tracking-[0.25px] transition-colors duration-md3-s3
                        ${activeSuggestionIndex === i
                          ? "bg-md-secondary-container text-md-on-secondary-container"
                          : "text-md-on-surface hover:bg-md-surface-container-high"}
                      `}
                    >
                      <svg className="w-5 h-5 text-md-on-surface-variant shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
