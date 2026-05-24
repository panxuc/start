import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type JsonStorageDriver = "vercel-blob" | "local-file" | "readonly-config";
export type JsonStorageKind = "navigation" | "site-settings";

const STORAGE_DRIVER_ENV_KEY = "START_STORAGE_DRIVER";
const START_DATA_DIR_ENV_KEY = "START_DATA_DIR";
const BLOB_RW_TOKEN_ENV_KEY = "BLOB_READ_WRITE_TOKEN";

const NAVIGATION_BLOB_URL_ENV_KEY = "NAVIGATION_BLOB_URL";
const NAVIGATION_FILE_PATH_ENV_KEY = "NAVIGATION_FILE_PATH";
const SITE_SETTINGS_BLOB_URL_ENV_KEY = "SITE_SETTINGS_BLOB_URL";
const SITE_SETTINGS_FILE_PATH_ENV_KEY = "SITE_SETTINGS_FILE_PATH";

const knownDrivers = new Set<JsonStorageDriver>([
  "vercel-blob",
  "local-file",
  "readonly-config",
]);

export function getStorageDriver(kind: JsonStorageKind): JsonStorageDriver {
  const configured = process.env[STORAGE_DRIVER_ENV_KEY]?.trim().toLowerCase();
  if (configured) {
    if (!knownDrivers.has(configured as JsonStorageDriver)) {
      throw new Error(
        `${STORAGE_DRIVER_ENV_KEY} must be one of: vercel-blob, local-file, readonly-config.`
      );
    }
    return configured as JsonStorageDriver;
  }

  const hasFilePath =
    kind === "navigation"
      ? !!process.env[NAVIGATION_FILE_PATH_ENV_KEY]
      : !!process.env[SITE_SETTINGS_FILE_PATH_ENV_KEY];
  if (hasFilePath || process.env[START_DATA_DIR_ENV_KEY]) {
    return "local-file";
  }

  const hasBlobUrl =
    kind === "navigation"
      ? !!process.env[NAVIGATION_BLOB_URL_ENV_KEY]
      : !!process.env[SITE_SETTINGS_BLOB_URL_ENV_KEY];
  if (hasBlobUrl || process.env[BLOB_RW_TOKEN_ENV_KEY]) {
    return "vercel-blob";
  }

  return "readonly-config";
}

export function resolveJsonPath(rawPath: string | undefined, fallbackName: string): string {
  const dataDir = process.env[START_DATA_DIR_ENV_KEY] || "data";
  const candidate = rawPath || path.join(dataDir, fallbackName);
  return path.isAbsolute(candidate) ? candidate : path.join(process.cwd(), candidate);
}

export async function readJsonFile(filePath: string): Promise<unknown | null> {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as unknown;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function readJsonUrl(url: string): Promise<unknown | null> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as unknown;
}

function encodePath(pathname: string): string {
  return pathname
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export async function writeVercelBlobJson(
  pathname: string,
  value: unknown
): Promise<{ url: string }> {
  const token = process.env[BLOB_RW_TOKEN_ENV_KEY];
  if (!token) {
    throw new Error(
      `缺少 ${BLOB_RW_TOKEN_ENV_KEY}。如果你在 VPS 或 Docker 中部署，可以设置 ${STORAGE_DRIVER_ENV_KEY}=local-file。`
    );
  }

  const encodedPath = encodePath(pathname);
  const response = await fetch(`https://blob.vercel-storage.com/${encodedPath}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=utf-8",
      "x-content-type": "application/json; charset=utf-8",
      "x-add-random-suffix": "0",
    },
    body: JSON.stringify(value, null, 2),
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
