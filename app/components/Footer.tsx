import { memo } from 'react';

const Footer = memo(function Footer() {
  return (
    <footer className="mt-auto py-8 w-full text-center bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <p className="text-gray-600 font-medium">
              Copyright © {new Date().getFullYear()} Xuc Pan. All Rights Reserved.
            </p>
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
          <a 
            href="https://beian.miit.gov.cn/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-blue-500 transition-colors duration-200 underline underline-offset-2"
          >
            京ICP备2025135198号-2
          </a>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
