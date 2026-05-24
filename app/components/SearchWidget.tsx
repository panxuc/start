"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SearchEngines } from "../config";

type SearchEngine = (typeof SearchEngines)[number];

function EngineTabs({
  engines,
  active,
  onChange,
}: {
  engines: typeof SearchEngines;
  active: SearchEngine;
  onChange: (engine: SearchEngine) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="搜索引擎">
      {engines.map((engine) => {
        const isActive = active.name === engine.name;
        return (
          <button
            key={engine.name}
            type="button"
            onClick={() => onChange(engine)}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-ink text-ivory"
                : "bg-transparent text-olive hover:bg-ink-tint hover:text-ink"
            }`}
          >
            {engine.name}
          </button>
        );
      })}
    </div>
  );
}

export default function SearchWidget() {
  const suggestionsListId = useId();
  const [query, setQuery] = useState("");
  const [activeEngine, setActiveEngine] = useState<SearchEngine>(SearchEngines[0]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const visibleSuggestions = suggestions.slice(0, 6);
  const suggestionsOpen = isFocused && visibleSuggestions.length > 0;
  const activeOptionId =
    activeSuggestionIndex >= 0 ? `${suggestionsListId}-option-${activeSuggestionIndex}` : undefined;

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
      if (!controller.signal.aborted) {
        setSuggestions([]);
        setActiveSuggestionIndex(-1);
      }
    }
  };

  const scheduleSuggestions = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    debounceRef.current = setTimeout(() => fetchSuggestions(value, controller), 260);
  };

  const handleSearch = (overrideQuery?: string) => {
    const q = (overrideQuery ?? query).trim();
    if (!q) return;
    window.open(activeEngine.url + encodeURIComponent(q), "_blank", "noopener,noreferrer");
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setIsFocused(false);
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
    handleSearch(suggestion);
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
      inputRef.current?.blur();
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
    <div className="flex w-full flex-col items-center gap-5">
      <EngineTabs engines={SearchEngines} active={activeEngine} onChange={setActiveEngine} />

      <div className="relative w-full">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
          className={`paper-card flex items-center gap-2 p-2 transition-shadow ${
            isFocused ? "shadow-paper" : ""
          }`}
        >
          <input
            ref={inputRef}
            value={query}
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={suggestionsOpen}
            aria-controls={suggestionsOpen ? suggestionsListId : undefined}
            aria-activedescendant={activeOptionId}
            aria-label={`使用 ${activeEngine.name} 搜索`}
            placeholder={`使用 ${activeEngine.name} 搜索`}
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[1.05rem] leading-none text-near-black outline-none placeholder:text-stone"
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              scheduleSuggestions(value);
            }}
            onFocus={() => {
              if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
              setIsFocused(true);
            }}
            onBlur={() => {
              blurTimeoutRef.current = setTimeout(() => {
                setIsFocused(false);
                setActiveSuggestionIndex(-1);
              }, 140);
            }}
            onKeyDown={handleInputKeyDown}
          />
          <button type="submit" className="paper-button shrink-0 px-5">
            搜索
          </button>
        </form>

        {suggestionsOpen && (
          <div className="paper-card absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden py-2">
            <div className="px-4 pb-1.5 text-xs font-medium text-stone">Bing 搜索建议</div>
            <ul id={suggestionsListId} role="listbox" aria-label="Bing 搜索建议">
              {visibleSuggestions.map((suggestion, index) => (
                <li
                  key={suggestion}
                  id={`${suggestionsListId}-option-${index}`}
                  role="option"
                  aria-selected={activeSuggestionIndex === index}
                >
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                    onClick={() => selectSuggestion(suggestion)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      activeSuggestionIndex === index
                        ? "bg-ink-tint text-ink"
                        : "text-warm-dark hover:bg-ink-tint hover:text-ink"
                    }`}
                  >
                    {suggestion}
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
