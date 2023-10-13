"use client";

import { memo, useState } from "react";
import SearchForm from "./SearchForm";

const searchConfigs = [
  {
    id: "google",
    actionUrl: "https://www.google.com/search",
    inputName: "q",
    placeholder: "Google Search...",
    label: "Google",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.147 8.027-3.24 2.053-2.053 2.627-5.307 2.627-7.467 0-.747-.08-1.467-.213-2.16h-10.44z" />
      </svg>
    )
  },
  {
    id: "baidu",
    actionUrl: "https://www.baidu.com/s",
    inputName: "wd",
    placeholder: "百度一下，你就知道",
    label: "百度",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.06 12.87c-1.38 1.29-3.48 1.47-4.2.39-.72-1.05.12-3.15 1.5-4.44 1.35-1.29 3.42-1.5 4.17-.42.75 1.05-.09 3.18-1.47 4.47zm7.62-5.49c-.27.69-.93.63-1.53.06-.9-1.02-1.11-2.91-.45-4.23.66-1.32 1.77-1.47 2.67-.45.87.96 1.14 2.85.48 4.2-.21.42-.69.42-1.17.42zM5.19 19.35c-1.62 1.53-4.05 1.62-5.19.45s.27-3.75 2.1-5.46c1.86-1.71 4.5-1.92 5.43-.72s.21 3.75-2.34 5.73zM15.3 24c-2.4 0-4.71-1.02-6.15-2.73-.39-.48-.27-1.17.24-1.53.48-.36 1.14-.24 1.53.21 2.04 2.43 5.91 2.22 8.79-.51.48-.45 1.23-.42 1.65.06.45.48.42 1.23-.06 1.68-1.5 1.41-3.96 2.82-6 2.82z" />
      </svg>
    )
  },
  {
    id: "bing",
    actionUrl: "https://www.bing.com/search",
    inputName: "q",
    placeholder: "Bing Search",
    label: "Bing",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.6 2.8v18.4l11.5-6.4-4.8-2.6-1.5 3.3-3.6 1.8V5.6l5.1 1.8 7.3-4.2-14-3.2Z" />
      </svg>
    )
  }
] as const;

// 提取类型
type SearchConfig = typeof searchConfigs[number];

const SearchDiv = memo(function SearchDiv() {
  // 核心修改：添加泛型 <SearchConfig>，告诉 TS 这里的状态可以是数组里的任意一种配置
  const [activeEngine, setActiveEngine] = useState<SearchConfig>(searchConfigs[0]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-10 relative z-20">
      {/* 引擎切换 Tabs */}
      <div className="flex justify-center mb-4 space-x-1">
        <div className="flex p-1 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
          {searchConfigs.map((config) => (
            <button
              key={config.id}
              onClick={() => setActiveEngine(config)}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeEngine.id === config.id
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {config.icon}
              <span className="hidden sm:inline">{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 统一的搜索框容器 */}
      <div className="transform transition-all duration-300 hover:scale-[1.01]">
        <SearchForm 
          key={activeEngine.id} // 确保切换时重新渲染以重置状态
          {...activeEngine} 
          api={activeEngine.id}
        />
      </div>
    </div>
  );
});

export default SearchDiv;
