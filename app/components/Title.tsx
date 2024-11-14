import Image from 'next/image';

export default function Title() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Image src="/favicon.ico" alt="Xuc Pan" width={32} height={32} className="rounded-lg" />
      <h1 className="text-4xl font-bold">Xuc Start</h1>
    </div>
  );
}
