export interface SiteSettings {
  siteName: string;
  faviconUrl: string;
  copyrightText: string;
  beianText: string;
  beianUrl: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "start",
  faviconUrl: "/favicon.ico",
  copyrightText: "",
  beianText: "",
  beianUrl: "https://beian.miit.gov.cn/",
};

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
