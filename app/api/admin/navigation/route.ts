import { NextRequest, NextResponse } from "next/server";
import { type CategoryMap, type LinkItem } from "../../../config";
import { isCategoryMap, isLinkItem, loadNavigation, saveNavigation } from "../../../lib/navigation";

const ADMIN_TOKEN_ENV_KEY = "NAVIGATION_ADMIN_TOKEN";

function isAuthorized(request: NextRequest): boolean {
  const expectedToken = process.env[ADMIN_TOKEN_ENV_KEY];
  if (!expectedToken) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return false;
  }

  const [scheme, token] = authHeader.split(" ");
  return scheme?.toLowerCase() === "bearer" && token === expectedToken;
}

function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: "Unauthorized. Use Authorization: Bearer <token>." },
    { status: 401 }
  );
}

function cloneCategories(categories: CategoryMap): CategoryMap {
  return Object.fromEntries(
    Object.entries(categories).map(([categoryName, links]) => [categoryName, links.map((link) => ({ ...link }))])
  );
}

function indexInRange(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length;
}

function insertAt<T>(items: T[], index: number, value: T): T[] {
  const safeIndex = Math.max(0, Math.min(index, items.length));
  return [...items.slice(0, safeIndex), value, ...items.slice(safeIndex)];
}

function getLinkIndex(links: LinkItem[], index?: unknown, url?: unknown): number {
  if (typeof index === "number" && Number.isInteger(index)) {
    return index;
  }
  if (typeof url === "string") {
    return links.findIndex((item) => item.url === url);
  }
  return -1;
}

function normalizeLink(link: LinkItem): LinkItem {
  const normalized: LinkItem = {
    name: link.name.trim(),
    url: link.url.trim(),
  };

  if (link.icon && typeof link.icon === "string" && link.icon.trim()) {
    normalized.icon = link.icon.trim();
  }

  return normalized;
}

function validateHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

type AddLinkOp = {
  action: "add_link";
  category: string;
  link: LinkItem;
  index?: number;
};

type DeleteLinkOp = {
  action: "delete_link";
  category: string;
  index?: number;
  url?: string;
};

type MoveLinkOp = {
  action: "move_link";
  fromCategory: string;
  fromIndex: number;
  toCategory: string;
  toIndex: number;
};

type UpdateLinkOp = {
  action: "update_link";
  category: string;
  index?: number;
  url?: string;
  patch: Partial<LinkItem>;
};

type AddCategoryOp = {
  action: "add_category";
  name: string;
  index?: number;
};

type DeleteCategoryOp = {
  action: "delete_category";
  name: string;
};

type MoveCategoryOp = {
  action: "move_category";
  name: string;
  toIndex: number;
};

type RenameCategoryOp = {
  action: "rename_category";
  name: string;
  newName: string;
};

type AdminOperation =
  | AddLinkOp
  | DeleteLinkOp
  | MoveLinkOp
  | UpdateLinkOp
  | AddCategoryOp
  | DeleteCategoryOp
  | MoveCategoryOp
  | RenameCategoryOp;

function applyOperation(categories: CategoryMap, operation: AdminOperation): { next: CategoryMap; message: string } {
  const next = cloneCategories(categories);

  switch (operation.action) {
    case "add_link": {
      const category = operation.category?.trim();
      if (!category || !next[category]) {
        throw new Error("Category not found.");
      }
      if (!isLinkItem(operation.link)) {
        throw new Error("Invalid link object.");
      }

      const normalized = normalizeLink(operation.link);
      if (!normalized.name || !validateHttpUrl(normalized.url)) {
        throw new Error("Invalid link data: name and http(s) url are required.");
      }

      const links = next[category];
      const duplicate = links.some((item) => item.url === normalized.url);
      if (duplicate) {
        throw new Error("Link already exists in category.");
      }

      const index = typeof operation.index === "number" ? operation.index : links.length;
      next[category] = insertAt(links, index, normalized);
      return { next, message: "Link added." };
    }
    case "delete_link": {
      const category = operation.category?.trim();
      if (!category || !next[category]) {
        throw new Error("Category not found.");
      }

      const links = next[category];
      const targetIndex = getLinkIndex(links, operation.index, operation.url);
      if (!indexInRange(targetIndex, links.length)) {
        throw new Error("Link not found by index/url.");
      }

      next[category] = links.filter((_, index) => index !== targetIndex);
      return { next, message: "Link deleted." };
    }
    case "move_link": {
      const fromCategory = operation.fromCategory?.trim();
      const toCategory = operation.toCategory?.trim();
      if (!fromCategory || !toCategory || !next[fromCategory] || !next[toCategory]) {
        throw new Error("Source or target category not found.");
      }

      const sourceLinks = [...next[fromCategory]];
      if (!indexInRange(operation.fromIndex, sourceLinks.length)) {
        throw new Error("fromIndex out of range.");
      }

      const [moved] = sourceLinks.splice(operation.fromIndex, 1);
      const targetLinks = fromCategory === toCategory ? sourceLinks : [...next[toCategory]];
      const adjustedTargetIndex =
        fromCategory === toCategory && operation.toIndex > operation.fromIndex
          ? operation.toIndex - 1
          : operation.toIndex;

      next[fromCategory] = fromCategory === toCategory ? targetLinks : sourceLinks;
      next[toCategory] = insertAt(targetLinks, adjustedTargetIndex, moved);
      return { next, message: "Link moved." };
    }
    case "update_link": {
      const category = operation.category?.trim();
      if (!category || !next[category]) {
        throw new Error("Category not found.");
      }

      const links = [...next[category]];
      const targetIndex = getLinkIndex(links, operation.index, operation.url);
      if (!indexInRange(targetIndex, links.length)) {
        throw new Error("Link not found by index/url.");
      }

      const patch = operation.patch || {};
      const updated = normalizeLink({
        ...links[targetIndex],
        ...patch,
      });

      if (!updated.name || !validateHttpUrl(updated.url)) {
        throw new Error("Invalid patch: name and http(s) url are required.");
      }

      const hasDuplicate = links.some((item, idx) => idx !== targetIndex && item.url === updated.url);
      if (hasDuplicate) {
        throw new Error("Another link already uses this url in the category.");
      }

      links[targetIndex] = updated;
      next[category] = links;
      return { next, message: "Link updated." };
    }
    case "add_category": {
      const name = operation.name?.trim();
      if (!name) {
        throw new Error("Category name is required.");
      }
      if (next[name]) {
        throw new Error("Category already exists.");
      }

      const entries = Object.entries(next);
      const index = typeof operation.index === "number" ? operation.index : entries.length;
      const inserted = insertAt(entries, index, [name, []] as [string, LinkItem[]]);
      return { next: Object.fromEntries(inserted), message: "Category added." };
    }
    case "delete_category": {
      const name = operation.name?.trim();
      if (!name || !next[name]) {
        throw new Error("Category not found.");
      }

      const entries = Object.entries(next).filter(([categoryName]) => categoryName !== name);
      if (entries.length === 0) {
        throw new Error("At least one category must remain.");
      }

      return { next: Object.fromEntries(entries), message: "Category deleted." };
    }
    case "move_category": {
      const name = operation.name?.trim();
      if (!name || !next[name]) {
        throw new Error("Category not found.");
      }

      const entries = Object.entries(next);
      const fromIndex = entries.findIndex(([categoryName]) => categoryName === name);
      const [moved] = entries.splice(fromIndex, 1);
      const reordered = insertAt(entries, operation.toIndex, moved);
      return { next: Object.fromEntries(reordered), message: "Category moved." };
    }
    case "rename_category": {
      const oldName = operation.name?.trim();
      const newName = operation.newName?.trim();
      if (!oldName || !newName || !next[oldName]) {
        throw new Error("Category not found or newName is invalid.");
      }
      if (oldName !== newName && next[newName]) {
        throw new Error("newName already exists.");
      }

      const entries = Object.entries(next).map(([categoryName, links]) =>
        categoryName === oldName ? ([newName, links] as [string, LinkItem[]]) : ([categoryName, links] as [string, LinkItem[]])
      );
      return { next: Object.fromEntries(entries), message: "Category renamed." };
    }
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  const data = await loadNavigation();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isCategoryMap(payload)) {
    return NextResponse.json(
      {
        error:
          "Invalid payload. Expected { [categoryName]: Array<{ name: string; url: string; icon?: string }> }.",
      },
      { status: 400 }
    );
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "At least one category is required." }, { status: 400 });
  }

  try {
    const { url } = await saveNavigation(payload);
    return NextResponse.json({
      ok: true,
      source: "blob",
      blobUrl: url,
      categories: payload,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to write navigation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || !("action" in payload)) {
    return NextResponse.json({ error: "Invalid payload. Missing action." }, { status: 400 });
  }

  const operation = payload as AdminOperation;
  const { categories } = await loadNavigation();

  try {
    const result = applyOperation(categories, operation);
    const { url } = await saveNavigation(result.next);
    return NextResponse.json({
      ok: true,
      message: result.message,
      source: "blob",
      blobUrl: url,
      categories: result.next,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply operation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
