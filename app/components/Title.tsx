import Image from 'next/image';
import { memo } from 'react';

const Title = memo(function Title() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl blur-sm opacity-20"></div>
        <Image 
          src="/favicon.ico" 
          alt="Xuc Pan" 
          width={48} 
          height={48} 
          className="relative rounded-2xl shadow-lg"
          priority={false}
          loading="lazy"
        />
      </div>
      <div className="flex flex-col">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Xuc Start
        </h1>
        <p className="text-gray-500 text-sm mt-1">Your gateway to the web</p>
      </div>
    </div>
  );
});

export default Title;
