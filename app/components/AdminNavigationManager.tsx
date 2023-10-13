"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Snackbar, Dialog } from "./md3";
import TokenAuth from "./admin/TokenAuth";
import SiteSettingsEditor from "./admin/SiteSettingsEditor";
import CategorySidebar from "./admin/CategorySidebar";
import LinkListEditor from "./admin/LinkListEditor";
import { type CategoryMap } from "../config";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "../lib/site-settings";

type AdminResponse = {
  error?: string;
  categories?: CategoryMap;
  settings?: SiteSettings;
};

const TOKEN_KEY = "navigation_admin_token";

function cloneCategories(categories: CategoryMap): CategoryMap {
  return Object.fromEntries(
    Object.entries(categories).map(([name, links]) => [name, links.map((l) => ({ ...l }))])
  );
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div className="animate-pulse space-y-16dp">
      <div className="rounded-md3-md bg-md-surface-container-high h-32dp" />
      <div className="rounded-md3-md bg-md-surface-container-high h-48dp" />
      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-16dp">
        <div className="rounded-md3-md bg-md-surface-container-high h-[400px]" />
        <div className="rounded-md3-md bg-md-surface-container-high h-[400px]" />
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "link"; index: number } | null>(null);

  const categoryNames = useMemo(() => Object.keys(categories ?? {}), [categories]);
  const navDirty = !!categories && JSON.stringify(categories) !== navSnapshot;
  const siteDirty = JSON.stringify(siteSettings) !== siteSnapshot;
  const isDirty = navDirty || siteDirty;
  const canEdit = !!token && !!categories;

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_KEY) || "";
    if (stored) { setTokenInput(stored); setToken(stored); }
  }, []);

  useEffect(() => {
    if (!categoryNames.length) { setActiveCategory(""); return; }
    if (!activeCategory || !categories?.[activeCategory]) setActiveCategory(categoryNames[0]);
  }, [activeCategory, categories, categoryNames]);

  /* ── Data operations ── */

  async function loadData() {
    const nextToken = tokenInput.trim();
    if (!nextToken) { setError("请先输入 Admin Token。"); return; }
    setLoading(true); setError(""); setMessage("");
    try {
      const headers = { authorization: `Bearer ${nextToken}` };
      const [navRes, setRes] = await Promise.all([
        fetch("/api/admin/navigation", { headers }),
        fetch("/api/admin/site-settings", { headers }),
      ]);
      const navData = (await navRes.json()) as AdminResponse;
      const setData = (await setRes.json()) as AdminResponse;
      if (!navRes.ok || !navData.categories) throw new Error(navData.error || "导航配置加载失败");
      if (!setRes.ok || !setData.settings) throw new Error(setData.error || "站点配置加载失败");
      const cat = cloneCategories(navData.categories);
      setCategories(cat); setNavSnapshot(JSON.stringify(cat));
      setSiteSettings(setData.settings); setSiteSnapshot(JSON.stringify(setData.settings));
      setToken(nextToken); setTokenInput(nextToken);
      window.localStorage.setItem(TOKEN_KEY, nextToken);
      setMessage("已加载导航与站点配置");
    } catch (err) { setError(err instanceof Error ? err.message : "加载失败"); }
    finally { setLoading(false); }
  }

  async function saveChanges() {
    if (!token || !categories) { setError("请先登录并加载数据。"); return; }
    if (!isDirty) { setMessage("没有需要保存的更改。"); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      const authed = (path: string, init?: RequestInit) =>
        fetch(path, { ...init, headers: { "content-type": "application/json", authorization: `Bearer ${token}`, ...(init?.headers || {}) } });

      if (navDirty) {
        const res = await authed("/api/admin/navigation", { method: "PUT", body: JSON.stringify(categories) });
        const data = (await res.json()) as AdminResponse;
        if (!res.ok || !data.categories) throw new Error(data.error || "导航配置保存失败");
        const cat = cloneCategories(data.categories);
        setCategories(cat); setNavSnapshot(JSON.stringify(cat));
      }
      if (siteDirty) {
        const res = await authed("/api/admin/site-settings", { method: "PUT", body: JSON.stringify(siteSettings) });
        const data = (await res.json()) as AdminResponse;
        if (!res.ok || !data.settings) throw new Error(data.error || "站点配置保存失败");
        setSiteSettings(data.settings); setSiteSnapshot(JSON.stringify(data.settings));
      }
      setMessage("保存成功");
    } catch (err) { setError(err instanceof Error ? err.message : "保存失败"); }
    finally { setSaving(false); }
  }

  function discardChanges() {
    if (navSnapshot && categories) setCategories(JSON.parse(navSnapshot) as CategoryMap);
    if (siteSnapshot) setSiteSettings(JSON.parse(siteSnapshot) as SiteSettings);
    setMessage("已撤销未保存更改"); setError("");
  }

  function updateDraft(updater: (c: CategoryMap) => CategoryMap) {
    if (!categories) return;
    try {
      const next = updater(cloneCategories(categories));
      setCategories(next); setError(""); setMessage("草稿已更新，记得保存");
    } catch (err) { setError(err instanceof Error ? err.message : "操作失败"); }
  }

  function updateSiteDraft(patch: Partial<SiteSettings>) {
    setSiteSettings((p) => ({ ...p, ...patch }));
    setError(""); setMessage("草稿已更新，记得保存");
  }

  function confirmDeleteLink() {
    if (!deleteConfirm || deleteConfirm.type !== "link") return;
    const index = deleteConfirm.index;
    updateDraft((d) => { d[activeCategory] = (d[activeCategory] || []).filter((_, i) => i !== index); return d; });
    setDeleteConfirm(null);
  }

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!categories) return;
      const key = e.key.toLowerCase(), mod = e.metaKey || e.ctrlKey;
      if (mod && key === "s") { e.preventDefault(); void saveChanges(); }
      if (key === "escape" && isDirty) { e.preventDefault(); discardChanges(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ── Render ── */
  return (
    <div className="flex flex-col gap-16dp text-md-on-surface">
      <TokenAuth
        tokenInput={tokenInput} setTokenInput={setTokenInput}
        loading={loading} canEdit={canEdit} saving={saving} isDirty={isDirty}
        onLoad={loadData} onSave={saveChanges} onDiscard={discardChanges}
      />

      {canEdit && (
        <SiteSettingsEditor settings={siteSettings} onUpdate={updateSiteDraft} />
      )}

      <Snackbar open={!!error} variant="error">{error}</Snackbar>
      <Snackbar open={!!message}>{message}</Snackbar>

      {canEdit && categories ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-16dp"
          >
            <CategorySidebar
              categories={categories} activeCategory={activeCategory}
              onSetActive={setActiveCategory} onUpdate={updateDraft}
            />
            <LinkListEditor
              categories={categories} activeCategory={activeCategory}
              onUpdate={updateDraft}
              onRequestDeleteLink={(index) => setDeleteConfirm({ type: "link", index })}
            />
          </motion.div>
        </AnimatePresence>
      ) : loading ? (
        <Skeleton />
      ) : null}

      <Dialog
        open={!!deleteConfirm}
        title="确认删除"
        description="此操作不可撤销，确定要删除吗？"
        confirmLabel="删除"
        destructive
        onConfirm={confirmDeleteLink}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
