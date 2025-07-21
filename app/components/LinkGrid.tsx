import React, { memo } from "react";

type Link = {
  name: string;
  url: string;
  desc: string;
};

interface LinkGridProps {
  links: Link[];
}

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
          className="group relative p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-300 text-center"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
              {link.name.charAt(0)}
            </div>
            <p className="font-medium text-gray-800 text-sm leading-tight truncate w-full">
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