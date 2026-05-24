"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Link2, Settings, Tags, Trash2, Undo2, Upload, X } from "lucide-react";
import TokenAuth from "./admin/TokenAuth";
import SiteSettingsEditor from "./admin/SiteSettingsEditor";
import CategorySidebar from "./admin/CategorySidebar";
import LinkListEditor from "./admin/LinkListEditor";
import { type CategoryMap } from "../config";
import { isCategoryMap, validateCategoryMap } from "../lib/navigation";
import {
  DEFAULT_SITE_SETTINGS,
  isSiteSettings,
  normalizeSiteSettings,
  type SiteSettings,
} from "../lib/site-settings";

type AdminResponse = {
  error?: string;
  categories?: CategoryMap;
  settings?: SiteSettings;
};

const TOKEN_KEY = "navigation_admin_token";

type AdminBackup = {
  version: 1;
  exportedAt: string;
  categories: CategoryMap;
  settings: SiteSettings;
};

type DeleteConfirm =
  | { type: "link"; index: number }
  | { type: "category"; name: string };

type AdminSection = "links" | "categories" | "site";

const adminSections: Array<{
  id: AdminSection;
  label: string;
  Icon: typeof Link2;
}> = [
  { id: "links", label: "链接", Icon: Link2 },
  { id: "categories", label: "分类", Icon: Tags },
  { id: "site", label: "站点", Icon: Settings },
];

function cloneCategories(categories: CategoryMap): CategoryMap {
  return Object.fromEntries(
    Object.entries(categories).map(([name, links]) => [name, links.map((link) => ({ ...link }))])
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-20 rounded-lg bg-paper-border" />
      <div className="h-28 rounded-lg bg-paper-border" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_1fr]">
        <div className="h-[400px] rounded-lg bg-paper-border" />
        <div className="h-[400px] rounded-lg bg-paper-border" />
      </div>
    </div>
  );
}

function Notice({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "error";
}) {
  return (
    <div
      className={`rounded-md border px-4 py-3 text-sm ${
        tone === "error"
          ? "border-danger-bg bg-danger-bg text-danger-fg"
          : "border-ink/10 bg-ink-tint text-ink"
      }`}
    >
      {children}
    </div>
  );
}

function friendlyError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : fallback;

  if (/Unauthorized|未授权/i.test(message)) {
    return "Admin Token 无效，或服务端未配置 NAVIGATION_ADMIN_TOKEN。请检查后重新加载。";
  }

  if (message.includes("BLOB_READ_WRITE_TOKEN")) {
    return "缺少 BLOB_READ_WRITE_TOKEN。Vercel Blob 部署请配置该变量；Docker/VPS 部署可设置 START_STORAGE_DRIVER=local-file。";
  }

  if (/只读配置|readonly-config|START_STORAGE_DRIVER/i.test(message)) {
    return "当前存储是只读配置，无法保存。请设置 START_STORAGE_DRIVER=local-file，或配置 Vercel Blob 后再保存。";
  }

  if (/EACCES|EROFS|permission|local file/i.test(message)) {
    return "本地文件存储不可写，请检查 NAVIGATION_FILE_PATH / SITE_SETTINGS_FILE_PATH 和挂载目录权限。";
  }

  if (/Invalid JSON|JSON/i.test(message)) {
    return "请求数据不是有效 JSON，请重新加载后再试。";
  }

  if (/Invalid payload|导航数据格式/i.test(message)) {
    return "导航数据格式不正确，请检查分类和链接后再保存。";
  }

  if (/Duplicate url|重复网址/i.test(message)) {
    return message.replace("Duplicate url:", "存在重复网址：");
  }

  if (/http\(s\)|Invalid link|网址/i.test(message)) {
    return "请检查网址：名称不能为空，URL 必须以 http(s) 开头。";
  }

  return message || fallback;
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  const ConfirmIcon = confirmLabel === "撤销" ? Undo2 : Trash2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-near-black/35 px-4">
      <div className="paper-card w-full max-w-sm p-6" role="dialog" aria-modal="true">
        <h2 className="text-xl font-semibold text-near-black">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-stone">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="paper-button secondary" onClick={onCancel}>
            <X className="h-4 w-4" aria-hidden="true" />
            取消
          </button>
          <button type="button" className="paper-button danger" onClick={onConfirm}>
            <ConfirmIcon className="h-4 w-4" aria-hidden="true" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminNavigationManager() {
  const [tokenInput, setTokenInput] = useState("");
  const [token, setToken] = useState("");
  const [categories, setCategories] = useState<CategoryMap | null>(null);
  const [activeCategory, setActiveCategory] = useState("");
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [navSnapshot, setNavSnapshot] = useState("");
  const [siteSnapshot, setSiteSnapshot] = useState(JSON.stringify(DEFAULT_SITE_SETTINGS));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm | null>(null);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [activeAdminSection, setActiveAdminSection] = useState<AdminSection>("links");
  const importInputRef = useRef<HTMLInputElement>(null);

  const categoryNames = useMemo(() => Object.keys(categories ?? {}), [categories]);
  const navDirty = !!categories && JSON.stringify(categories) !== navSnapshot;
  const siteDirty = JSON.stringify(siteSettings) !== siteSnapshot;
  const isDirty = navDirty || siteDirty;
  const canEdit = !!token && !!categories;

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_KEY) || "";
    if (stored) {
      setTokenInput(stored);
      setToken(stored);
    }
  }, []);

  useEffect(() => {
    if (!categoryNames.length) {
      setActiveCategory("");
      return;
    }

    if (!activeCategory || !categories?.[activeCategory]) {
      setActiveCategory(categoryNames[0]);
    }
  }, [activeCategory, categories, categoryNames]);

  async function loadData() {
    const nextToken = tokenInput.trim();
    if (!nextToken) {
      setError("请先输入 Admin Token。");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const headers = { authorization: `Bearer ${nextToken}` };
      const [navRes, settingsRes] = await Promise.all([
        fetch("/api/admin/navigation", { headers }),
        fetch("/api/admin/site-settings", { headers }),
      ]);
      const navData = (await navRes.json()) as AdminResponse;
      const settingsData = (await settingsRes.json()) as AdminResponse;

      if (!navRes.ok || !navData.categories) {
        throw new Error(navData.error || "导航配置加载失败");
      }

      if (!settingsRes.ok || !settingsData.settings) {
        throw new Error(settingsData.error || "站点配置加载失败");
      }

      const nextCategories = cloneCategories(navData.categories);
      setCategories(nextCategories);
      setNavSnapshot(JSON.stringify(nextCategories));
      setSiteSettings(settingsData.settings);
      setSiteSnapshot(JSON.stringify(settingsData.settings));
      setToken(nextToken);
      setTokenInput(nextToken);
      window.localStorage.setItem(TOKEN_KEY, nextToken);
      setMessage("已加载导航与站点配置");
    } catch (err) {
      setError(friendlyError(err, "加载失败"));
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    if (!token || !categories) {
      setError("请先登录并加载数据。");
      return;
    }

    if (!isDirty) {
      setMessage("没有需要保存的更改。");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const authed = (path: string, init?: RequestInit) =>
        fetch(path, {
          ...init,
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
            ...(init?.headers || {}),
          },
        });

      if (navDirty) {
        const res = await authed("/api/admin/navigation", {
          method: "PUT",
          body: JSON.stringify(categories),
        });
        const data = (await res.json()) as AdminResponse;
        if (!res.ok || !data.categories) throw new Error(data.error || "导航配置保存失败");
        const nextCategories = cloneCategories(data.categories);
        setCategories(nextCategories);
        setNavSnapshot(JSON.stringify(nextCategories));
      }

      if (siteDirty) {
        const res = await authed("/api/admin/site-settings", {
          method: "PUT",
          body: JSON.stringify(siteSettings),
        });
        const data = (await res.json()) as AdminResponse;
        if (!res.ok || !data.settings) throw new Error(data.error || "站点配置保存失败");
        setSiteSettings(data.settings);
        setSiteSnapshot(JSON.stringify(data.settings));
      }

      setMessage("保存成功");
    } catch (err) {
      setError(friendlyError(err, "保存失败"));
    } finally {
      setSaving(false);
    }
  }

  function discardChanges() {
    if (navSnapshot && categories) setCategories(JSON.parse(navSnapshot) as CategoryMap);
    if (siteSnapshot) setSiteSettings(JSON.parse(siteSnapshot) as SiteSettings);
    setMessage("已撤销未保存更改");
    setError("");
    setDiscardConfirm(false);
  }

  function requestDiscardChanges() {
    if (!isDirty) return;
    setDiscardConfirm(true);
  }

  function updateDraft(updater: (categories: CategoryMap) => CategoryMap) {
    if (!categories) return;

    try {
      const next = updater(cloneCategories(categories));
      setCategories(next);
      setError("");
      setMessage("草稿已更新，记得保存");
    } catch (err) {
      setError(friendlyError(err, "操作失败"));
    }
  }

  function updateSiteDraft(patch: Partial<SiteSettings>) {
    setSiteSettings((previous) => ({ ...previous, ...patch }));
    setError("");
    setMessage("草稿已更新，记得保存");
  }

  function exportJson() {
    if (!categories) return;

    const payload: AdminBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      categories,
      settings: siteSettings,
    };
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `start-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function importJsonFile(file: File) {
    if (!categories) return;
    if (isDirty && !window.confirm("导入 JSON 会覆盖当前草稿，是否继续？")) {
      return;
    }

    try {
      const payload = JSON.parse(await file.text()) as unknown;
      const maybeRecord =
        payload && typeof payload === "object" && !Array.isArray(payload)
          ? (payload as { categories?: unknown; settings?: unknown })
          : null;
      const rawCategories = isCategoryMap(payload) ? payload : maybeRecord?.categories;

      if (!isCategoryMap(rawCategories)) {
        throw new Error("JSON 中没有有效的导航分类。");
      }

      const nextCategories = validateCategoryMap(rawCategories);
      const rawSettings = maybeRecord?.settings;
      const nextSettings = isSiteSettings(rawSettings)
        ? normalizeSiteSettings(rawSettings)
        : siteSettings;

      setCategories(nextCategories);
      setSiteSettings(nextSettings);
      if (!nextCategories[activeCategory]) {
        setActiveCategory(Object.keys(nextCategories)[0] || "");
      }
      setActiveAdminSection("links");
      setError("");
      setMessage("已导入 JSON，检查无误后保存");
    } catch (err) {
      setError(friendlyError(err, "导入失败"));
    }
  }

  function confirmDelete() {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === "link") {
      const index = deleteConfirm.index;
      updateDraft((draft) => {
        draft[activeCategory] = (draft[activeCategory] || []).filter((_, itemIndex) => itemIndex !== index);
        return draft;
      });
      setDeleteConfirm(null);
      return;
    }

    const categoryName = deleteConfirm.name;
    updateDraft((draft) => {
      if (!draft[categoryName]) return draft;
      if (Object.keys(draft).length <= 1) throw new Error("至少保留一个分类");
      delete draft[categoryName];
      return draft;
    });
    setDeleteConfirm(null);
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!categories) return;
      const key = event.key.toLowerCase();
      const mod = event.metaKey || event.ctrlKey;

      if (mod && key === "s") {
        event.preventDefault();
        void saveChanges();
      }

      if (key === "escape") {
        event.preventDefault();
        if (deleteConfirm) {
          setDeleteConfirm(null);
          return;
        }
        if (discardConfirm) {
          setDiscardConfirm(false);
          return;
        }
        if (isDirty) setDiscardConfirm(true);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex flex-col gap-4 text-near-black">
      <TokenAuth
        tokenInput={tokenInput}
        setTokenInput={setTokenInput}
        loading={loading}
        canEdit={canEdit}
        saving={saving}
        isDirty={isDirty}
        onLoad={loadData}
        onSave={saveChanges}
        onDiscard={requestDiscardChanges}
      />

      {error && <Notice tone="error">{error}</Notice>}
      {message && <Notice>{message}</Notice>}

      {canEdit && categories && (
        <div className="paper-card flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-end">
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void importJsonFile(file);
            }}
          />
          <button
            type="button"
            className="paper-button secondary"
            onClick={() => importInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            导入 JSON
          </button>
          <button type="button" className="paper-button ghost" onClick={exportJson}>
            <Download className="h-4 w-4" aria-hidden="true" />
            导出 JSON
          </button>
        </div>
      )}

      {canEdit && (
        <div className="grid grid-cols-3 gap-2 xl:hidden" role="tablist" aria-label="后台编辑区域">
          {adminSections.map(({ id, label, Icon }) => {
            const isActive = activeAdminSection === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`paper-button min-h-9 px-2 py-2 text-sm ${
                  isActive ? "" : "ghost"
                }`}
                onClick={() => setActiveAdminSection(id)}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      )}

      {canEdit && (
        <div className={`${activeAdminSection === "site" ? "block" : "hidden"} xl:block`}>
          <SiteSettingsEditor settings={siteSettings} onUpdate={updateSiteDraft} />
        </div>
      )}

      {canEdit && categories ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_1fr]">
          <div className={`${activeAdminSection === "categories" ? "block" : "hidden"} xl:block`}>
            <CategorySidebar
              categories={categories}
              activeCategory={activeCategory}
              onSetActive={(name) => {
                setActiveCategory(name);
                setActiveAdminSection("links");
              }}
              onUpdate={updateDraft}
              onRequestDeleteCategory={(name) => setDeleteConfirm({ type: "category", name })}
            />
          </div>
          <div className={`${activeAdminSection === "links" ? "block" : "hidden"} xl:block`}>
            <LinkListEditor
              categories={categories}
              activeCategory={activeCategory}
              onUpdate={updateDraft}
              onRequestDeleteLink={(index) => setDeleteConfirm({ type: "link", index })}
            />
          </div>
        </div>
      ) : loading ? (
        <Skeleton />
      ) : null}

      <ConfirmDialog
        open={!!deleteConfirm}
        title={deleteConfirm?.type === "category" ? "删除分类" : "删除网址"}
        description={
          deleteConfirm?.type === "category"
            ? `将删除“${deleteConfirm.name}”分类及其中全部网址。此操作会先进入草稿，保存后生效。`
            : "将删除这个网址。此操作会先进入草稿，保存后生效。"
        }
        confirmLabel="删除"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      <ConfirmDialog
        open={discardConfirm}
        title="撤销未保存更改"
        description="将恢复到最近一次加载或保存后的状态，当前草稿会被清空。"
        confirmLabel="撤销"
        onConfirm={discardChanges}
        onCancel={() => setDiscardConfirm(false)}
      />
    </div>
  );
}
