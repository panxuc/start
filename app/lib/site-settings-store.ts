import {
  getStorageDriver,
  readJsonFile,
  readJsonUrl,
  resolveJsonPath,
  writeJsonFile,
  writeVercelBlobJson,
  type JsonStorageDriver,
} from "./json-storage";
import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
  normalizeSiteSettings,
} from "./site-settings";

const SITE_SETTINGS_BLOB_URL_ENV_KEY = "SITE_SETTINGS_BLOB_URL";
const SITE_SETTINGS_BLOB_PATH_ENV_KEY = "SITE_SETTINGS_BLOB_PATH";
const SITE_SETTINGS_FILE_PATH_ENV_KEY = "SITE_SETTINGS_FILE_PATH";
const DEFAULT_BLOB_PATH = "site-settings.json";
const DEFAULT_FILE_NAME = "site-settings.local.json";

export type SiteSettingsLoadResult = {
  settings: SiteSettings;
  source: string;
  storage: JsonStorageDriver;
  path?: string;
};

export type SiteSettingsSaveResult = {
  source: string;
  url?: string;
  path?: string;
};

export async function loadSiteSettings(): Promise<SiteSettingsLoadResult> {
  const storage = getStorageDriver("site-settings");

  if (storage === "local-file") {
    const filePath = resolveJsonPath(process.env[SITE_SETTINGS_FILE_PATH_ENV_KEY], DEFAULT_FILE_NAME);
    try {
      const data = await readJsonFile(filePath);
      if (data) {
        return {
          settings: normalizeSiteSettings(data),
          source: "local-file",
          storage,
          path: filePath,
        };
      }
    } catch (error) {
      console.error("Failed to load site settings from local file:", error);
    }

    return {
      settings: normalizeSiteSettings(DEFAULT_SITE_SETTINGS),
      source: "fallback-default",
      storage,
      path: filePath,
    };
  }

  if (storage === "vercel-blob") {
    const blobUrl = process.env[SITE_SETTINGS_BLOB_URL_ENV_KEY];
    if (blobUrl) {
      try {
        const data = await readJsonUrl(blobUrl);
        if (data) {
          return {
            settings: normalizeSiteSettings(data),
            source: "vercel-blob",
            storage,
          };
        }
      } catch (error) {
        console.error("Failed to load site settings from Blob:", error);
      }
    }
  }

  return {
    settings: normalizeSiteSettings(DEFAULT_SITE_SETTINGS),
    source: "fallback-default",
    storage,
  };
}

export async function saveSiteSettings(settings: SiteSettings): Promise<SiteSettingsSaveResult> {
  const storage = getStorageDriver("site-settings");
  const normalized = normalizeSiteSettings(settings);

  if (storage === "local-file") {
    const filePath = resolveJsonPath(process.env[SITE_SETTINGS_FILE_PATH_ENV_KEY], DEFAULT_FILE_NAME);
    await writeJsonFile(filePath, normalized);
    return { source: "local-file", path: filePath };
  }

  if (storage === "vercel-blob") {
    const pathname = process.env[SITE_SETTINGS_BLOB_PATH_ENV_KEY] || DEFAULT_BLOB_PATH;
    const { url } = await writeVercelBlobJson(pathname, normalized);
    return { source: "vercel-blob", url };
  }

  throw new Error(
    "当前使用只读配置，无法保存。请设置 START_STORAGE_DRIVER=local-file，或配置 Vercel Blob 后再保存。"
  );
}
