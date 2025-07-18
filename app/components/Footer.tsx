export default function Footer() {
  return (
    <footer className="mt-8 w-full text-center text-gray-500">
      Copyright © {new Date().getFullYear()} Xuc Pan. All Rights Reserved.
      <p className="text-sm mt-2">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">京ICP备2025135198号-2</a>
      </p>
    </footer>
  );
}
