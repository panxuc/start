import { memo } from 'react';

const Footer = memo(function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center gap-3 md:gap-6 text-sm text-gray-500 dark:text-gray-400/80 transition-colors duration-300">
        
        {/* Copyright 部分 */}
        <div className="flex items-center gap-2">
          <span className="font-medium hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-default">
            © {currentYear} Xuc Pan
          </span>
        </div>

        {/* 分隔符 (仅在桌面端显示) */}
        <span className="hidden md:block w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>

        {/* 备案号链接 */}
        <a 
          href="https://beian.miit.gov.cn/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative group flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
        >
          {/* 小图标 (可选，增加精致感) */}
          <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-4 absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>京ICP备2025135198号-2</span>
        </a>

      </div>
    </footer>
  );
});

export default Footer;
