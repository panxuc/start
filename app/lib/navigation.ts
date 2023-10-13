import { Categories, type CategoryMap, type LinkItem } from "../config";

const BLOB_URL_ENV_KEY = "NAVIGATION_BLOB_URL";
const BLOB_RW_TOKEN_ENV_KEY = "BLOB_READ_WRITE_TOKEN";
const BLOB_PATH_ENV_KEY = "NAVIGATION_BLOB_PATH";
const DEFAULT_BLOB_PATH = "navigation.json";

function encodePath(pathname: string): string {
  return pathname
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
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

export async function loadNavigation(): Promise<{ categories: CategoryMap; source: string }> {
  const blobUrl = process.env[BLOB_URL_ENV_KEY];

  if (blobUrl) {
    try {
      const response = await fetch(blobUrl, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        if (isCategoryMap(data) && Object.keys(data).length > 0) {
          return { categories: data, source: "blob" };
        }
      }
    } catch (error) {
      console.error("Failed to load navigation from Blob:", error);
    }
  }

  return { categories: Categories, source: "fallback-config" };
}

export async function saveNavigation(categories: CategoryMap): Promise<{ url: string }> {
  const token = process.env[BLOB_RW_TOKEN_ENV_KEY];
  if (!token) {
    throw new Error(`Missing ${BLOB_RW_TOKEN_ENV_KEY}`);
  }

  const pathname = process.env[BLOB_PATH_ENV_KEY] || DEFAULT_BLOB_PATH;
  const encodedPath = encodePath(pathname);
  const response = await fetch(`https://blob.vercel-storage.com/${encodedPath}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=utf-8",
      "x-content-type": "application/json; charset=utf-8",
      "x-add-random-suffix": "0",
    },
    body: JSON.stringify(categories, null, 2),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Blob write failed (${response.status}): ${body}`);
  }

  const result = (await response.json()) as { url?: string };
  if (!result.url) {
    throw new Error("Blob write response missing url");
  }

  return { url: result.url };
}
