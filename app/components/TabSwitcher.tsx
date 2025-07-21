"use client";

import React, { useState, useMemo, memo } from "react";
import LinkGrid from "./LinkGrid";

// Define types for the props for better type-safety
type Link = {
  name: string;
  url: string;
  desc: string;
};

type CategoriesType = {
  [key: string]: Link[];
};

interface TabSwitcherProps {
  categories: CategoriesType;
}

const TabSwitcher = memo(function TabSwitcher({ categories }: TabSwitcherProps) {
  const categoryKeys = useMemo(() => Object.keys(categories), [categories]);
  const [selectedTab, setSelectedTab] = useState(() => categoryKeys[0]);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categoryKeys.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSelectedTab(tab)}
            className={`relative py-2.5 px-4 text-sm font-medium rounded-full transition-all duration-300 ${
              selectedTab === tab
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
                : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 border border-gray-200 hover:border-gray-300 hover:shadow-md"
            }`}
          >
            {selectedTab === tab && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm opacity-30 -z-10"></div>
            )}
            {tab}
          </button>
        ))}
      </div>

      <div className="transition-opacity duration-500 ease-in-out opacity-90 w-full" key={selectedTab}>
        <LinkGrid links={categories[selectedTab]} />
      </div>
    </>
  );
});

export default TabSwitcher;