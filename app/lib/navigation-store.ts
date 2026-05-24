import { type CategoryMap } from "../config";
import {
  getStorageDriver,
  readJsonFile,
  readJsonUrl,
  resolveJsonPath,
  writeJsonFile,
  writeVercelBlobJson,
  type JsonStorageDriver,
} from "./json-storage";
import { fallbackNavigation, isCategoryMap, validateCategoryMap } from "./navigation";

const NAVIGATION_BLOB_URL_ENV_KEY = "NAVIGATION_BLOB_URL";
const NAVIGATION_BLOB_PATH_ENV_KEY = "NAVIGATION_BLOB_PATH";
const NAVIGATION_FILE_PATH_ENV_KEY = "NAVIGATION_FILE_PATH";
const DEFAULT_BLOB_PATH = "navigation.json";
const DEFAULT_FILE_NAME = "navigation.local.json";

export type NavigationLoadResult = {
  categories: CategoryMap;
  source: string;
  storage: JsonStorageDriver;
  path?: string;
};

export type NavigationSaveResult = {
  source: string;
  url?: string;
  path?: string;
};

export async function loadNavigation(): Promise<NavigationLoadResult> {
  const storage = getStorageDriver("navigation");

  if (storage === "local-file") {
    const filePath = resolveJsonPath(process.env[NAVIGATION_FILE_PATH_ENV_KEY], DEFAULT_FILE_NAME);
    try {
      const data = await readJsonFile(filePath);
      if (isCategoryMap(data) && Object.keys(data).length > 0) {
        return {
          categories: validateCategoryMap(data),
          source: "local-file",
          storage,
          path: filePath,
        };
      }
    } catch (error) {
      console.error("Failed to load navigation from local file:", error);
    }

    return {
      categories: fallbackNavigation(),
      source: "fallback-config",
      storage,
      path: filePath,
    };
  }

  if (storage === "vercel-blob") {
    const blobUrl = process.env[NAVIGATION_BLOB_URL_ENV_KEY];
    if (blobUrl) {
      try {
        const data = await readJsonUrl(blobUrl);
        if (isCategoryMap(data) && Object.keys(data).length > 0) {
          return {
            categories: validateCategoryMap(data),
            source: "vercel-blob",
            storage,
          };
        }
      } catch (error) {
        console.error("Failed to load navigation from Blob:", error);
      }
    }
  }

  return {
    categories: fallbackNavigation(),
    source: "fallback-config",
    storage,
  };
}

export async function saveNavigation(categories: CategoryMap): Promise<NavigationSaveResult> {
  const storage = getStorageDriver("navigation");
  const normalized = validateCategoryMap(categories);

  if (storage === "local-file") {
    const filePath = resolveJsonPath(process.env[NAVIGATION_FILE_PATH_ENV_KEY], DEFAULT_FILE_NAME);
    await writeJsonFile(filePath, normalized);
    return { source: "local-file", path: filePath };
  }

  if (storage === "vercel-blob") {
    const pathname = process.env[NAVIGATION_BLOB_PATH_ENV_KEY] || DEFAULT_BLOB_PATH;
    const { url } = await writeVercelBlobJson(pathname, normalized);
    return { source: "vercel-blob", url };
  }

  throw new Error(
    "当前使用只读配置，无法保存。请设置 START_STORAGE_DRIVER=local-file，或配置 Vercel Blob 后再保存。"
  );
}
