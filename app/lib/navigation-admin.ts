import { type CategoryMap, type LinkItem } from "../config";
import {
  cloneCategories,
  isLinkItem,
  normalizeLink,
  validateCategoryMap,
  validateHttpUrl,
} from "./navigation";

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

export type AdminOperation =
  | AddLinkOp
  | DeleteLinkOp
  | MoveLinkOp
  | UpdateLinkOp
  | AddCategoryOp
  | DeleteCategoryOp
  | MoveCategoryOp
  | RenameCategoryOp;

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

export function applyNavigationOperation(
  categories: CategoryMap,
  operation: AdminOperation
): { next: CategoryMap; message: string } {
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
        categoryName === oldName
          ? ([newName, links] as [string, LinkItem[]])
          : ([categoryName, links] as [string, LinkItem[]])
      );
      return { next: Object.fromEntries(entries), message: "Category renamed." };
    }
  }
}

export function applyAndValidateNavigationOperation(
  categories: CategoryMap,
  operation: AdminOperation
): { next: CategoryMap; message: string } {
  const result = applyNavigationOperation(categories, operation);
  return {
    ...result,
    next: validateCategoryMap(result.next),
  };
}
