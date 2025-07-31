"use client";

import React, { memo, useState, useRef, useCallback, useEffect } from "react";

type Link = {
  name: string;
  url: string;
  desc: string;
  icon?: string;
};

interface LinkGridProps {
  links: Link[];
}

const faviconCache = new Map<string, { url: string; loaded: boolean; error: boolean }>();

const CACHE_EXPIRY_DAYS = 365; // 1 year cache
const CACHE_KEY_PREFIX = 'favicon_cache_';

interface CachedFavicon {
  url: string;
  loaded: boolean;
  error: boolean;
  timestamp: number;
}

const getFaviconFromStorage = (domain: string): CachedFavicon | null => {
  try {
    const stored = localStorage.getItem(CACHE_KEY_PREFIX + domain);
    if (!stored) return null;
    
    const cached: CachedFavicon = JSON.parse(stored);
    const now = Date.now();
    const expiryTime = cached.timestamp + (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    
    if (now > expiryTime) {
      localStorage.removeItem(CACHE_KEY_PREFIX + domain);
      return null;
    }
    
    return cached;
  } catch {
    return null;
  }
};

const saveFaviconToStorage = (domain: string, data: Omit<CachedFavicon, 'timestamp'>) => {
  try {
    const cacheData: CachedFavicon = {
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY_PREFIX + domain, JSON.stringify(cacheData));
  } catch {
    // localStorage might be full or disabled
  }
};

const FaviconImage = memo(function FaviconImage({ url, name }: { url: string; name: string }) {
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  };
  
  const domain = getDomain(url);
  const cacheKey = domain;
  
  // Always start with consistent initial state (no localStorage access during SSR)
  const [cacheState, setCacheState] = useState(() => {
    const cached = faviconCache.get(cacheKey);
    return cached || { url: '', loaded: false, error: false };
  });
  
  // Load from localStorage after hydration
  useEffect(() => {
    // Check localStorage for persistent cache after hydration
    const persistentCache = getFaviconFromStorage(cacheKey);
    if (persistentCache) {
      const state = { url: persistentCache.url, loaded: persistentCache.loaded, error: persistentCache.error };
      faviconCache.set(cacheKey, state);
      setCacheState(state);
    }
  }, [cacheKey]);
  
  const getFaviconUrl = useCallback((url: string) => {
    const domain = getDomain(url);
    return domain ? `/api/favicon?domain=${encodeURIComponent(domain)}` : '';
  }, []);
  
  const faviconUrl = getFaviconUrl(url);
  
  const handleLoad = useCallback(() => {
    const newState = { url: faviconUrl, loaded: true, error: false };
    faviconCache.set(cacheKey, newState);
    saveFaviconToStorage(cacheKey, newState);
    setCacheState(newState);
  }, [faviconUrl, cacheKey]);
  
  const handleError = useCallback(() => {
    const newState = { url: faviconUrl, loaded: false, error: true };
    faviconCache.set(cacheKey, newState);
    saveFaviconToStorage(cacheKey, newState);
    setCacheState(newState);
  }, [faviconUrl, cacheKey]);
  
  if (!faviconUrl || cacheState.error) {
    return (
      <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
        {name.charAt(0)}
      </div>
    );
  }
  
  return (
    <div className="w-4 h-4 rounded overflow-hidden bg-gray-100 flex-shrink-0">
      {!cacheState.loaded && (
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
          {name.charAt(0)}
        </div>
      )}
      <img
        src={faviconUrl}
        alt={`${name} favicon`}
        width={16}
        height={16}
        className={`w-full h-full object-cover ${!cacheState.loaded ? 'hidden' : 'block'}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
});

const LinkGrid = memo(function LinkGrid({ links }: LinkGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 w-full max-w-7xl mx-auto">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.desc || link.name}
          className="group relative p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="flex items-center space-x-2">
            <FaviconImage url={link.url} name={link.name} />
            <p className="font-medium text-gray-800 text-sm leading-tight truncate flex-1">
              {link.name}
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
        </a>
      ))}
    </div>
  );
});

export default LinkGrid;