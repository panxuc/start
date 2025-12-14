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
    <div className="w-4 h-4 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full max-w-7xl mx-auto px-2">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.desc || link.name}
          className="group relative flex flex-col items-center p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
        >
          <div className="mb-3 p-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
            <FaviconImage url={link.url} name={link.name} />
          </div>
          <p className="font-medium text-gray-700 dark:text-gray-200 text-sm text-center line-clamp-1 w-full px-1">
            {link.name}
          </p>
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 dark:ring-white/5 group-hover:ring-blue-400/30 transition-all duration-300"></div>
        </a>
      ))}
    </div>
  );
});

export default LinkGrid;
