import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="paper-card max-w-md px-8 py-10 text-center">
        <p className="text-[4.5rem] font-semibold leading-none text-ink">404</p>
        <h1 className="mt-5 text-2xl font-semibold text-near-black">页面未找到</h1>
        <p className="mt-3 text-sm leading-6 text-stone">你访问的页面不存在或已被移除。</p>
        <Link className="paper-button mt-7" href="/">
          返回首页
        </Link>
      </div>
    </div>
  );
}
