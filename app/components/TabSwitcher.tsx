"use client";

import React, { useState, useMemo, memo } from "react";
import LinkGrid from "./LinkGrid";

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
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-wrap justify-center gap-2 mb-8 p-1.5 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 inline-flex mx-auto">
        {categoryKeys.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSelectedTab(tab)}
            className={`px-5 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
              selectedTab === tab
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-sm scale-100"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500" key={selectedTab}>
        <LinkGrid links={categories[selectedTab]} />
      </div>
    </div>
  );
});

export default TabSwitcher;
