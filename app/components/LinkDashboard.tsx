"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { pinyin } from "pinyin-pro";
import { Categories, type CategoryMap, type LinkItem } from "../config";

const failedIconHosts = new Set<string>();

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function normalizedText(value: string): string {
  return value.trim().toLowerCase();
}

function compactText(value: string): string {
  return normalizedText(value).replace(/\s+/g, "");
}

function toPinyin(value: string, pattern?: "first"): string {
  const source = value.trim();
  if (!source) return "";

  return pinyin(source, {
    pattern,
    toneType: "none",
  }).toLowerCase();
}

function HighlightText({ text, query }: { text: string; query: string }) {
  const normalizedQuery = normalizedText(query);
  if (!normalizedQuery) return <>{text}</>;

  const source = text;
  const sourceLower = source.toLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;
  let index = sourceLower.indexOf(normalizedQuery);

  while (index >= 0) {
    if (index > cursor) {
      parts.push(source.slice(cursor, index));
    }
    const match = source.slice(index, index + normalizedQuery.length);
    parts.push(
      <mark key={`${index}-${match}`} className="rounded bg-ink-tint px-0.5 text-ink">
        {match}
      </mark>
    );
    cursor = index + normalizedQuery.length;
    index = sourceLower.indexOf(normalizedQuery, cursor);
  }

  if (cursor < source.length) {
    parts.push(source.slice(cursor));
  }

  return <>{parts}</>;
}

type CategorizedLink = LinkItem & {
  category: string;
};

type SearchRecord = {
  link: CategorizedLink;
  text: string;
  compact: string;
};

function buildSearchRecord(link: CategorizedLink): SearchRecord {
  const hostname = getHostname(link.url).replace(/^www\./, "");
  const literalText = `${link.category} ${link.name} ${link.url} ${hostname}`;
  const pinyinSource = `${link.category} ${link.name}`;
  const fullPinyin = toPinyin(pinyinSource);
  const firstLetters = toPinyin(pinyinSource, "first");
  const text = normalizedText(`${literalText} ${fullPinyin} ${firstLetters}`);

  return {
    link,
    text,
    compact: compactText(text),
  };
}

const Favicon = ({ url, name }: { url: string; name: string }) => {
  const hostname = useMemo(() => getHostname(url), [url]);
  const [failed, setFailed] = useState(() => !hostname || failedIconHosts.has(hostname));
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
    setFailed(!hostname || failedIconHosts.has(hostname));
  }, [hostname, url]);

  useEffect(() => {
    if (failed || !hostname) return;
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [failed, hostname]);

  const iconUrl = hostname ? `/api/favicon?domain=${encodeURIComponent(hostname)}&size=64` : "";
  const fallbackLetter = name.slice(0, 1).toUpperCase();

  return (
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-paper-border bg-ivory text-sm font-semibold text-ink">
      <span
        aria-hidden="true"
        className={`transition-opacity ${loaded && !failed ? "opacity-0" : "opacity-100"}`}
      >
        {loaded && !failed ? null : fallbackLetter}
      </span>
      {!failed && hostname && iconUrl && (
        <img
          ref={imageRef}
          src={iconUrl}
          alt=""
          className={`absolute h-7 w-7 object-contain transition-opacity ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={(event) => {
            if (event.currentTarget.naturalWidth > 0) {
              setLoaded(true);
            }
          }}
          onError={() => {
            failedIconHosts.add(hostname);
            setFailed(true);
          }}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      )}
    </span>
  );
};

function Skeleton() {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-8 w-20 animate-pulse rounded bg-paper-border" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="paper-card flex items-center gap-3 p-4">
            <div className="h-11 w-11 animate-pulse rounded-md bg-paper-border" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-paper-border" />
              <div className="h-3 w-32 animate-pulse rounded bg-paper-border-soft" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LinkDashboard() {
  const [categoryMap, setCategoryMap] = useState<CategoryMap>(Categories);
  const [loading, setLoading] = useState(true);
  const categories = useMemo(() => Object.keys(categoryMap), [categoryMap]);
  const [activeCategory, setActiveCategory] = useState(categories[0] || "");
  const [quickFilter, setQuickFilter] = useState("");
  const allLinks = useMemo(
    () =>
      Object.entries(categoryMap).flatMap(([category, links]) =>
        links.map((link) => ({ ...link, category }))
      ),
    [categoryMap]
  );
  const searchRecords = useMemo(() => allLinks.map(buildSearchRecord), [allLinks]);
  const filterText = normalizedText(quickFilter);
  const compactFilterText = compactText(quickFilter);
  const isFiltering = !!filterText;
  const links = useMemo<CategorizedLink[]>(() => {
    if (filterText) {
      return searchRecords
        .filter((record) => {
          if (record.text.includes(filterText)) return true;
          return !!compactFilterText && record.compact.includes(compactFilterText);
        })
        .map((record) => record.link);
    }

    return (categoryMap[activeCategory] ?? []).map((link) => ({
      ...link,
      category: activeCategory,
    }));
  }, [activeCategory, categoryMap, compactFilterText, filterText, searchRecords]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/navigation", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (
          data?.categories &&
          typeof data.categories === "object" &&
          Object.keys(data.categories).length
        ) {
          setCategoryMap(data.categories as CategoryMap);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!categories.length) {
      if (activeCategory) setActiveCategory("");
      return;
    }

    if (!activeCategory || !categoryMap[activeCategory]) {
      setActiveCategory(categories[0]);
    }
  }, [activeCategory, categories, categoryMap]);

  if (loading) return <Skeleton />;
  if (!categories.length || !activeCategory) return null;

  const resultLabel = isFiltering
    ? `找到 ${links.length} 条网址`
    : `${activeCategory} · ${links.length} 条`;

  return (
    <section className="flex w-full flex-col gap-4">
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex h-11 items-center gap-2 rounded-md border border-paper-border-soft bg-ivory/75 px-3 transition-colors focus-within:border-ink/50 focus-within:bg-ivory">
          <Search className="h-4 w-4 shrink-0 text-stone" aria-hidden="true" />
          <input
            value={quickFilter}
            onChange={(event) => setQuickFilter(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setQuickFilter("");
              }
            }}
            placeholder="筛选已收录网址"
            aria-label="筛选已收录网址，支持中文、拼音、网址"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm leading-5 text-near-black outline-none placeholder:text-stone"
          />
          <div className="hidden shrink-0 text-right text-xs font-medium leading-5 text-stone sm:block">
            {resultLabel}
          </div>
          {isFiltering && (
            <button
              type="button"
              aria-label="清除筛选"
              title="清除筛选"
              className="paper-button ghost h-7 min-h-0 w-7 shrink-0 px-0 py-0"
              onClick={() => setQuickFilter("")}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:overflow-visible sm:px-0">
        <div className="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap">
          {categories.map((category) => {
            const isActive = activeCategory === category && !isFiltering;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setActiveCategory(category);
                  setQuickFilter("");
                }}
                className={`shrink-0 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-ink text-ivory"
                    : "bg-transparent text-olive hover:bg-ink-tint hover:text-ink"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {links.length === 0 ? (
        <div className="paper-card px-4 py-8 text-center text-sm text-stone">
          没有匹配的网址
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {links.map((link) => {
          const hostname = getHostname(link.url).replace(/^www\./, "");

          return (
            <a
              key={`${link.category}-${link.url}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="paper-card group flex min-h-[82px] items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-paper"
            >
              <Favicon url={link.url} name={link.name} />
              <span className="min-w-0">
                <span className="block truncate text-[0.98rem] font-semibold leading-snug text-near-black group-hover:text-ink">
                  <HighlightText text={link.name} query={quickFilter} />
                </span>
                <span className="mt-1 flex min-w-0 items-center gap-2">
                  {isFiltering && (
                    <span className="shrink-0 rounded bg-ink-tint px-1.5 py-0.5 text-[0.68rem] leading-none text-ink">
                      <HighlightText text={link.category} query={quickFilter} />
                    </span>
                  )}
                  <span className="block truncate font-mono text-xs leading-snug text-stone">
                    <HighlightText text={hostname || link.url} query={quickFilter} />
                  </span>
                </span>
              </span>
            </a>
          );
        })}
        </div>
      )}
    </section>
  );
}
