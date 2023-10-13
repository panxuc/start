import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-md-background p-24dp">
      <div className="max-w-md text-center">
        <div className="text-[5rem] font-light text-md-primary leading-none mb-16dp">404</div>
        <h1 className="text-[1.375rem] font-normal text-md-on-surface mb-8dp">页面未找到</h1>
        <p className="text-[0.875rem] text-md-on-surface-variant mb-24dp">
          你访问的页面不存在或已被移除
        </p>
        <Link
          href="/"
          className="md3-state-layer inline-flex items-center justify-center rounded-md3-full bg-md-primary text-md-on-primary px-24dp py-10dp text-[0.875rem] font-medium tracking-[0.1px] transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
