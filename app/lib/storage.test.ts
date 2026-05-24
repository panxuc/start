import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadNavigation, saveNavigation } from "./navigation-store";
import { loadSiteSettings, saveSiteSettings } from "./site-settings-store";

let tempDir = "";

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "start-"));
  vi.stubEnv("START_STORAGE_DRIVER", "local-file");
  vi.stubEnv("NAVIGATION_FILE_PATH", path.join(tempDir, "navigation.json"));
  vi.stubEnv("SITE_SETTINGS_FILE_PATH", path.join(tempDir, "site-settings.json"));
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(tempDir, { recursive: true, force: true });
});

describe("local file storage", () => {
  it("saves and loads navigation JSON", async () => {
    const categories = {
      常用: [{ name: "GitHub", url: "https://github.com" }],
    };

    const saved = await saveNavigation(categories);
    const loaded = await loadNavigation();

    expect(saved.source).toBe("local-file");
    expect(saved.path).toContain("navigation.json");
    expect(loaded.source).toBe("local-file");
    expect(loaded.categories).toEqual(categories);
  });

  it("saves and loads site settings JSON", async () => {
    const saved = await saveSiteSettings({
      siteName: "example",
      faviconUrl: "/favicon.ico",
      copyrightText: "Example",
      beianText: "",
      beianUrl: "https://beian.miit.gov.cn/",
    });
    const loaded = await loadSiteSettings();

    expect(saved.source).toBe("local-file");
    expect(saved.path).toContain("site-settings.json");
    expect(loaded.source).toBe("local-file");
    expect(loaded.settings.siteName).toBe("example");
    expect(loaded.settings.copyrightText).toContain("Example");
  });
});
