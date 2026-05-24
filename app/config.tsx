export interface LinkItem {
  name: string;
  url: string;
  icon?: string;
}

export interface CategoryMap {
  [key: string]: LinkItem[];
}

export const SearchEngines = [
  { name: "Google", url: "https://www.google.com/search?q=", icon: "G" },
  { name: "Bing", url: "https://www.bing.com/search?q=", icon: "B" },
  { name: "Baidu", url: "https://www.baidu.com/s?wd=", icon: "du" },
  { name: "GitHub", url: "https://github.com/search?q=", icon: "Hs" },
];

export const Categories: CategoryMap = {
  常用: [
    { name: "GitHub", url: "https://github.com" },
    { name: "Vercel", url: "https://vercel.com" },
    { name: "OpenAI", url: "https://openai.com" },
  ],
  学习: [
    { name: "MDN Web Docs", url: "https://developer.mozilla.org" },
    { name: "ArXiv", url: "https://arxiv.org" },
  ],
  工具: [
    { name: "Next.js", url: "https://nextjs.org" },
  ],
};
