import { useState, useEffect, useRef } from 'react';

interface SearchFormProps {
  actionUrl: string;
  inputName: string;
  placeholder: string;
  buttonLabel: string;
  api: string;
}

export default function SearchForm({ actionUrl, inputName, placeholder, buttonLabel, api }: SearchFormProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const suggestionsRef = useRef<HTMLUListElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length > 1) {
      try {
        // Use a backend proxy to avoid CORS issues
        const response = await fetch(`/api/suggestions/${api}?query=${value}`);
        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setSuggestions([]);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      suggestionsRef.current &&
      !suggestionsRef.current.contains(event.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(event.target as Node)
    ) {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <form action={actionUrl} method="get" target="_blank" className="flex items-center gap-2 relative">
      <div className="w-full relative">
        <input
          ref={inputRef}
          type="text"
          name={inputName}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="px-4 py-2 border border-gray-300 rounded-lg w-full"
        />
        {suggestions.length > 0 && (
          <ul ref={suggestionsRef} className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg mt-1 z-10">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">
        {buttonLabel}
      </button>
    </form>
  );
}
