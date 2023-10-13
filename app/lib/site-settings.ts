import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "../site-settings";

const SITE_SETTINGS_BLOB_URL_ENV_KEY = "SITE_SETTINGS_BLOB_URL";
const SITE_SETTINGS_BLOB_PATH_ENV_KEY = "SITE_SETTINGS_BLOB_PATH";
const BLOB_RW_TOKEN_ENV_KEY = "BLOB_READ_WRITE_TOKEN";
const DEFAULT_SITE_SETTINGS_BLOB_PATH = "site-settings.json";

function encodePath(pathname: string): string {
  return pathname
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function asTrimmedString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function defaultCopyright(): string {
  return `© ${new Date().getFullYear()}`;
}

function formatCopyright(value: string): string {
  const year = new Date().getFullYear();
  const text = value.trim();

  if (!text) {
    return `© ${year}`;
  }

  if (/^©\s*\d{4}/.test(text)) {
    return text;
  }

  return `© ${year} ${text}`;
}

export function isSiteSettings(value: unknown): value is SiteSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const target = value as Partial<SiteSettings>;
  return (
    typeof target.siteName === "string" &&
    typeof target.faviconUrl === "string" &&
    typeof target.copyrightText === "string" &&
    typeof target.beianText === "string" &&
    typeof target.beianUrl === "string"
  );
}

export function normalizeSiteSettings(value: unknown): SiteSettings {
  const source = isSiteSettings(value) ? value : DEFAULT_SITE_SETTINGS;
  const normalizedCopyright = asTrimmedString(source.copyrightText);
  return {
    siteName: asTrimmedString(source.siteName, DEFAULT_SITE_SETTINGS.siteName) || DEFAULT_SITE_SETTINGS.siteName,
    faviconUrl: asTrimmedString(source.faviconUrl, DEFAULT_SITE_SETTINGS.faviconUrl) || DEFAULT_SITE_SETTINGS.faviconUrl,
    copyrightText: formatCopyright(normalizedCopyright || defaultCopyright()),
    beianText: asTrimmedString(source.beianText, DEFAULT_SITE_SETTINGS.beianText),
    beianUrl: asTrimmedString(source.beianUrl, DEFAULT_SITE_SETTINGS.beianUrl),
  };
}

export async function loadSiteSettings(): Promise<{ settings: SiteSettings; source: string }> {
  const blobUrl = process.env[SITE_SETTINGS_BLOB_URL_ENV_KEY];
  if (blobUrl) {
    try {
      const response = await fetch(blobUrl, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        return { settings: normalizeSiteSettings(data), source: "blob" };
      }
    } catch (error) {
      console.error("Failed to load site settings from Blob:", error);
    }
  }

  return { settings: DEFAULT_SITE_SETTINGS, source: "fallback-default" };
}

export async function saveSiteSettings(settings: SiteSettings): Promise<{ url: string }> {
  const token = process.env[BLOB_RW_TOKEN_ENV_KEY];
  if (!token) {
    throw new Error(`Missing ${BLOB_RW_TOKEN_ENV_KEY}`);
  }

  const pathname = process.env[SITE_SETTINGS_BLOB_PATH_ENV_KEY] || DEFAULT_SITE_SETTINGS_BLOB_PATH;
  const encodedPath = encodePath(pathname);
  const response = await fetch(`https://blob.vercel-storage.com/${encodedPath}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=utf-8",
      "x-content-type": "application/json; charset=utf-8",
      "x-add-random-suffix": "0",
    },
    body: JSON.stringify(normalizeSiteSettings(settings), null, 2),
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
