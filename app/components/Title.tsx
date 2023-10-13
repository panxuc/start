import Image from 'next/image';
import { memo } from 'react';

const Title = memo(function Title() {
  return (
    <div className="flex flex-col items-center gap-3 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <Image 
          src="/favicon.ico" 
          alt="Logo" 
          width={42} 
          height={42} 
          className="relative rounded-xl shadow-sm bg-white dark:bg-gray-800 p-1"
          priority
        />
      </div>
      {/* 如果不需要显示文字标题（为了更极简），可以注释掉下面这部分，
         或者只在 hover Logo 时显示 
      */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
        Xuc Start
      </h1>
    </div>
  );
});

export default Title;
