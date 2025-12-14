"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";

interface SearchFormProps {
  actionUrl: string;
  inputName: string;
  placeholder: string;
  api: string;
}

const SearchForm = memo(function SearchForm({ actionUrl, inputName, placeholder, api }: SearchFormProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const suggestionsRef = useRef<HTMLUListElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (value: string) => {
    if (value.length > 1) {
      try {
        const response = await fetch(`/api/suggestions/${api}?query=${value}`);
        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (error) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  }, [api]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  }, [fetchSuggestions]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputValue(suggestion);
    setSuggestions([]);
    // 可选：点击建议直接搜索
    // if (inputRef.current?.form) inputRef.current.form.submit();
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      suggestionsRef.current &&
      !suggestionsRef.current.contains(event.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(event.target as Node)
    ) {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <form action={actionUrl} method="get" target="_blank" className="relative w-full">
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          name={inputName}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full px-6 py-4 pr-14 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 placeholder-gray-400 text-gray-800 dark:text-gray-100 text-lg"
        />
        
        <button 
          type="submit" 
          title="Search"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {suggestions.length > 0 && (
          <ul ref={suggestionsRef} className="absolute top-full left-0 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-2xl mt-2 shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-6 py-2.5 cursor-pointer hover:bg-blue-50/80 dark:hover:bg-gray-700/80 transition-colors text-gray-700 dark:text-gray-200 text-base flex items-center space-x-3"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
});

export default SearchForm;
