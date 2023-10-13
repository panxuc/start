"use client";

import React, { memo, useState, useMemo } from "react";

type Link = {
  name: string;
  url: string;
  desc: string;
  icon?: string;
};

interface LinkGridProps {
  links: Link[];
}

const FaviconImage = memo(function FaviconImage({ url, name }: { url: string; name: string }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const faviconUrl = useMemo(() => {
    try {
      const domain = new URL(url).hostname;
      return `/api/favicon?domain=${encodeURIComponent(domain)}`;
    } catch {
      return null;
    }
  }, [url]);

  if (!faviconUrl || status === 'error') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs rounded-lg shadow-inner">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
      <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 font-bold text-xs transition-opacity duration-300 ${status === 'success' ? 'opacity-0' : 'opacity-100'}`}>
        {name.charAt(0).toUpperCase()}
      </div>

      <img
        src={faviconUrl}
        alt={`${name} icon`}
        className={`w-full h-full object-cover transition-all duration-500 ease-in-out ${status === 'success' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        onLoad={() => setStatus('success')}
        onError={() => setStatus('error')}
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
          <div className="mb-3 p-2 w-12 h-12 bg-white dark:bg-gray-700 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
            <FaviconImage url={link.url} name={link.name} />
          </div>
          <p className="font-medium text-gray-700 dark:text-gray-200 text-sm text-center line-clamp-1 w-full px-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {link.name}
          </p>
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 dark:ring-white/5 group-hover:ring-blue-400/30 transition-all duration-300"></div>
        </a>
      ))}
    </div>
  );
});

export default LinkGrid;
