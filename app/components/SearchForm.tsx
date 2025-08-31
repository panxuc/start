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
        console.error('Error fetching suggestions:', error);
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [handleClickOutside]);

  return (
    <form action={actionUrl} method="get" target="_blank" className="group relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={inputName}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
        />
        <button 
          type="submit" 
          title="Search"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        {suggestions.length > 0 && (
          <ul ref={suggestionsRef} className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl mt-2 shadow-lg backdrop-blur-sm z-10 overflow-hidden">
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-gray-900 dark:text-gray-100"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
});

export default SearchForm;
