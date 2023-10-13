export interface SiteSettings {
  siteName: string;
  faviconUrl: string;
  copyrightText: string;
  beianText: string;
  beianUrl: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "Start",
  faviconUrl: "/favicon.ico",
  copyrightText: "",
  beianText: "",
  beianUrl: "https://beian.miit.gov.cn/",
};
