import { Categories, type CategoryMap, type LinkItem } from "../config";

export function cloneCategories(categories: CategoryMap): CategoryMap {
  return Object.fromEntries(
    Object.entries(categories).map(([categoryName, links]) => [
      categoryName,
      links.map((link) => ({ ...link })),
    ])
  );
}

export function fallbackNavigation(): CategoryMap {
  return cloneCategories(Categories);
}

export function isLinkItem(value: unknown): value is LinkItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeLink = value as Partial<LinkItem>;
  return typeof maybeLink.name === "string" && typeof maybeLink.url === "string";
}

export function isCategoryMap(value: unknown): value is CategoryMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((links) => Array.isArray(links) && links.every(isLinkItem));
}

export function normalizeLink(link: LinkItem): LinkItem {
  const normalized: LinkItem = {
    name: link.name.trim(),
    url: link.url.trim(),
  };

  if (link.icon && typeof link.icon === "string" && link.icon.trim()) {
    normalized.icon = link.icon.trim();
  }

  return normalized;
}

export function validateHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateCategoryMap(categories: CategoryMap): CategoryMap {
  const normalizedEntries: Array<[string, LinkItem[]]> = [];
  const seenCategories = new Set<string>();
  const seenUrls = new Set<string>();

  for (const [rawCategoryName, links] of Object.entries(categories)) {
    const categoryName = rawCategoryName.trim();
    if (!categoryName) {
      throw new Error("分类名不能为空。");
    }

    if (seenCategories.has(categoryName)) {
      throw new Error(`分类名重复：${categoryName}`);
    }
    seenCategories.add(categoryName);

    const normalizedLinks = links.map((link) => {
      const normalized = normalizeLink(link);
      if (!normalized.name || !validateHttpUrl(normalized.url)) {
        throw new Error(`“${categoryName}”中存在无效网址，名称不能为空，URL 必须以 http(s) 开头。`);
      }

      if (seenUrls.has(normalized.url)) {
        throw new Error(`存在重复网址：${normalized.url}`);
      }
      seenUrls.add(normalized.url);
      return normalized;
    });

    normalizedEntries.push([categoryName, normalizedLinks]);
  }

  if (!normalizedEntries.length) {
    throw new Error("至少保留一个分类。");
  }

  return Object.fromEntries(normalizedEntries);
}
