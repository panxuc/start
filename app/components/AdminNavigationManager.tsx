"use client";

import { useEffect, useMemo, useState } from "react";
import { type CategoryMap } from "../config";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "../site-settings";

type AdminResponse = {
  error?: string;
  categories?: CategoryMap;
  settings?: SiteSettings;
};

const TOKEN_STORAGE_KEY = "navigation_admin_token";

function cloneCategories(categories: CategoryMap): CategoryMap {
  return Object.fromEntries(
    Object.entries(categories).map(([categoryName, links]) => [
      categoryName,
      links.map((link) => ({ ...link })),
    ])
  );
}

function moveInArray<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [picked] = next.splice(from, 1);
  next.splice(to, 0, picked);
  return next;
}

export default function AdminNavigationManager() {
  const [tokenInput, setTokenInput] = useState("");
  const [token, setToken] = useState("");
  const [categories, setCategories] = useState<CategoryMap | null>(null);
  const [activeCategory, setActiveCategory] = useState("");
  const [addName, setAddName] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [moveTargets, setMoveTargets] = useState<Record<number, string>>({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [renameCategoryName, setRenameCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [navSnapshot, setNavSnapshot] = useState("");
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [siteSnapshot, setSiteSnapshot] = useState(JSON.stringify(DEFAULT_SITE_SETTINGS));
  const [dragCategoryIndex, setDragCategoryIndex] = useState<number | null>(null);
  const [dragLinkIndex, setDragLinkIndex] = useState<number | null>(null);

  const categoryNames = useMemo(() => Object.keys(categories ?? {}), [categories]);
  const links = categories?.[activeCategory] ?? [];
  const navDirty = !!categories && JSON.stringify(categories) !== navSnapshot;
  const siteDirty = JSON.stringify(siteSettings) !== siteSnapshot;
  const isDirty = navDirty || siteDirty;
  const canEdit = !!token && !!categories;

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY) || "";
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
      setRenameCategoryName(categoryNames[0]);
    }
  }, [activeCategory, categories, categoryNames]);

  async function authedRequest(path: string, init?: RequestInit): Promise<Response> {
    return fetch(path, {
      ...init,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
        ...(init?.headers || {}),
      },
    });
  }

  async function loadData(currentToken?: string) {
    const nextToken = (currentToken ?? token).trim();
    if (!nextToken) {
      setError("请先输入 Admin Token。");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const authHeaders = { authorization: `Bearer ${nextToken}` };
      const [navigationResponse, settingsResponse] = await Promise.all([
        fetch("/api/admin/navigation", { headers: authHeaders }),
        fetch("/api/admin/site-settings", { headers: authHeaders }),
      ]);
      const navigationData = (await navigationResponse.json()) as AdminResponse;
      const settingsData = (await settingsResponse.json()) as AdminResponse;

      if (!navigationResponse.ok || !navigationData.categories) {
        throw new Error(navigationData.error || "导航配置加载失败");
      }
      if (!settingsResponse.ok || !settingsData.settings) {
        throw new Error(settingsData.error || "站点配置加载失败");
      }

      const nextCategories = cloneCategories(navigationData.categories);
      const nextSettings = settingsData.settings;

      setCategories(nextCategories);
      setNavSnapshot(JSON.stringify(nextCategories));
      setSiteSettings(nextSettings);
      setSiteSnapshot(JSON.stringify(nextSettings));
      setToken(nextToken);
      setTokenInput(nextToken);
      window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      setMessage("已加载导航与站点配置");
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(updater: (current: CategoryMap) => CategoryMap) {
    if (!categories) {
      return;
    }
    try {
      const next = updater(cloneCategories(categories));
      setCategories(next);
      setError("");
      setMessage("草稿已更新，记得保存");
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  }

  function updateSiteDraft(patch: Partial<SiteSettings>) {
    setSiteSettings((previous) => ({
      ...previous,
      ...patch,
    }));
    setError("");
    setMessage("草稿已更新，记得保存");
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
      if (navDirty) {
        const response = await authedRequest("/api/admin/navigation", {
          method: "PUT",
          body: JSON.stringify(categories),
        });
        const data = (await response.json()) as AdminResponse;
        if (!response.ok || !data.categories) {
          throw new Error(data.error || "导航配置保存失败");
        }
        const next = cloneCategories(data.categories);
        setCategories(next);
        setNavSnapshot(JSON.stringify(next));
      }

      if (siteDirty) {
        const response = await authedRequest("/api/admin/site-settings", {
          method: "PUT",
          body: JSON.stringify(siteSettings),
        });
        const data = (await response.json()) as AdminResponse;
        if (!response.ok || !data.settings) {
          throw new Error(data.error || "站点配置保存失败");
        }
        setSiteSettings(data.settings);
        setSiteSnapshot(JSON.stringify(data.settings));
      }

      setMessage("保存成功");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  function discardChanges() {
    if (navSnapshot && categories) {
      setCategories(JSON.parse(navSnapshot) as CategoryMap);
    }
    if (siteSnapshot) {
      setSiteSettings(JSON.parse(siteSnapshot) as SiteSettings);
    }
    setMessage("已撤销未保存更改");
    setError("");
  }

  function addLinkToDraft() {
    const name = addName.trim();
    const url = addUrl.trim();
    if (!name || !url || !activeCategory) {
      return;
    }
    updateDraft((draft) => {
      draft[activeCategory] = [...(draft[activeCategory] || []), { name, url }];
      return draft;
    });
    setAddName("");
    setAddUrl("");
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!categories) {
        return;
      }

      const key = event.key.toLowerCase();
      const withMod = event.metaKey || event.ctrlKey;

      if (withMod && key === "s") {
        event.preventDefault();
        void saveChanges();
        return;
      }

      if (withMod && key === "enter") {
        event.preventDefault();
        addLinkToDraft();
        return;
      }

      if (key === "escape" && isDirty) {
        event.preventDefault();
        discardChanges();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [categories, isDirty, addName, addUrl, activeCategory, navSnapshot, siteSettings, siteSnapshot, token]);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 text-zinc-800 dark:text-zinc-100">
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <input
            type="password"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            placeholder="NAVIGATION_ADMIN_TOKEN"
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900"
          />
          <button
            onClick={() => loadData(tokenInput)}
            disabled={loading}
            className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "加载中..." : "加载"}
          </button>
          <button
            onClick={saveChanges}
            disabled={!canEdit || saving || !isDirty}
            className="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            onClick={discardChanges}
            disabled={!canEdit || saving || !isDirty}
            className="rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            撤销
          </button>
        </div>
        <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-3">
          <span>Token 仅保存在浏览器 LocalStorage</span>
          <span>快捷键: Ctrl/Cmd+S 保存, Ctrl/Cmd+Enter 添加, Esc 撤销</span>
          <span className={isDirty ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}>
            {isDirty ? "未保存" : "已同步"}
          </span>
        </div>
      </section>

      {canEdit && (
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-4">
          <h2 className="text-sm font-semibold mb-3">站点信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-300">
              网站名
              <input
                value={siteSettings.siteName}
                onChange={(event) => updateSiteDraft({ siteName: event.target.value })}
                className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-2 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-300">
              Favicon URL
              <input
                value={siteSettings.faviconUrl}
                onChange={(event) => updateSiteDraft({ faviconUrl: event.target.value })}
                placeholder="/favicon.ico 或 https://..."
                className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-2 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-300">
              版权信息
              <input
                value={siteSettings.copyrightText}
                onChange={(event) => updateSiteDraft({ copyrightText: event.target.value })}
                className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-2 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-300">
              备案号
              <input
                value={siteSettings.beianText}
                onChange={(event) => updateSiteDraft({ beianText: event.target.value })}
                className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-2 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-300 md:col-span-2">
              备案链接
              <input
                value={siteSettings.beianUrl}
                onChange={(event) => updateSiteDraft({ beianUrl: event.target.value })}
                className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-2 text-sm outline-none"
              />
            </label>
          </div>
        </section>
      )}

      {error && (
        <div className="rounded-lg border border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </div>
      )}

      {categories && (
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
          <aside className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-3 flex flex-col gap-3">
            <h2 className="text-sm font-semibold">分类</h2>
            <div className="max-h-[520px] overflow-auto no-scrollbar flex flex-col gap-1.5">
              {categoryNames.map((name, index) => {
                const isActive = name === activeCategory;
                return (
                  <div
                    key={name}
                    className={`grid grid-cols-[1fr_auto_auto] gap-1 rounded-md transition ${
                      dragCategoryIndex === index ? "bg-sky-50/70 dark:bg-sky-900/25" : ""
                    }`}
                    draggable
                    onDragStart={(event) => {
                      setDragCategoryIndex(index);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (dragCategoryIndex === null || dragCategoryIndex === index) {
                        return;
                      }
                      updateDraft((draft) => {
                        const entries = Object.entries(draft);
                        return Object.fromEntries(moveInArray(entries, dragCategoryIndex, index));
                      });
                    }}
                    onDragEnd={() => setDragCategoryIndex(null)}
                  >
                    <button
                      onClick={() => {
                        setActiveCategory(name);
                        setRenameCategoryName(name);
                      }}
                      className={`text-left rounded-md px-2.5 py-2 text-sm border transition ${
                        isActive
                          ? "bg-sky-50 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300"
                          : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700/70"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate">{name}</span>
                        <span className="shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 text-[10px] leading-none text-zinc-700 dark:text-zinc-200">
                          {(categories?.[name] || []).length}
                        </span>
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        updateDraft((draft) => {
                          const entries = Object.entries(draft);
                          return Object.fromEntries(moveInArray(entries, index, index - 1));
                        })
                      }
                      disabled={index === 0}
                      className="rounded-md border border-zinc-300 dark:border-zinc-600 px-2 text-xs disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() =>
                        updateDraft((draft) => {
                          const entries = Object.entries(draft);
                          return Object.fromEntries(moveInArray(entries, index, index + 1));
                        })
                      }
                      disabled={index === categoryNames.length - 1}
                      className="rounded-md border border-zinc-300 dark:border-zinc-600 px-2 text-xs disabled:opacity-40"
                    >
                      ↓
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder="新分类"
                  className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-2 text-sm outline-none"
                />
                <button
                  onClick={() => {
                    const name = newCategoryName.trim();
                    if (!name) return;
                    updateDraft((draft) => {
                      if (draft[name]) {
                        throw new Error("分类已存在");
                      }
                      draft[name] = [];
                      return draft;
                    });
                    setNewCategoryName("");
                  }}
                  className="rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 text-sm"
                >
                  添加
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  value={renameCategoryName}
                  onChange={(event) => setRenameCategoryName(event.target.value)}
                  placeholder="重命名"
                  className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-2 text-sm outline-none"
                />
                <button
                  onClick={() => {
                    const nextName = renameCategoryName.trim();
                    if (!nextName || !activeCategory) return;
                    updateDraft((draft) => {
                      if (!draft[activeCategory]) {
                        return draft;
                      }
                      if (nextName !== activeCategory && draft[nextName]) {
                        throw new Error("目标分类名已存在");
                      }
                      const entries = Object.entries(draft).map(([name, value]) =>
                        name === activeCategory ? ([nextName, value] as [string, typeof value]) : ([name, value] as [string, typeof value])
                      );
                      setActiveCategory(nextName);
                      return Object.fromEntries(entries);
                    });
                  }}
                  className="rounded-md border border-zinc-300 dark:border-zinc-600 px-3 text-sm"
                >
                  重命名
                </button>
              </div>
              <button
                onClick={() =>
                  updateDraft((draft) => {
                    if (!activeCategory || !draft[activeCategory]) {
                      return draft;
                    }
                    if (Object.keys(draft).length <= 1) {
                      throw new Error("至少保留一个分类");
                    }
                    delete draft[activeCategory];
                    return draft;
                  })
                }
                className="rounded-md border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-3 py-2 text-sm"
              >
                删除当前分类
              </button>
            </div>
          </aside>

          <section className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{activeCategory || "未选择分类"}</h2>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{links.length} 条</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-2">
              <input
                value={addName}
                onChange={(event) => setAddName(event.target.value)}
                placeholder="名称"
                className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-2 text-sm outline-none"
              />
              <input
                value={addUrl}
                onChange={(event) => setAddUrl(event.target.value)}
                placeholder="https://example.com"
                className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-2 text-sm outline-none"
              />
              <button
                onClick={() => {
                  addLinkToDraft();
                }}
                className="rounded-md bg-sky-600 text-white px-3 py-2 text-sm font-medium"
              >
                添加
              </button>
            </div>

            <div className="max-h-[620px] overflow-auto no-scrollbar border border-zinc-200 dark:border-zinc-700 rounded-lg">
              {links.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">当前分类暂无网址</div>
              )}
              {links.map((link, index) => (
                <div
                  key={`${link.url}-${index}`}
                  className={`grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 last:border-b-0 transition ${
                    dragLinkIndex === index
                      ? "bg-sky-50 dark:bg-sky-900/25"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                  }`}
                  draggable
                  onDragStart={(event) => {
                    setDragLinkIndex(index);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (dragLinkIndex === null || dragLinkIndex === index) {
                      return;
                    }
                    updateDraft((draft) => {
                      draft[activeCategory] = moveInArray(draft[activeCategory] || [], dragLinkIndex, index);
                      return draft;
                    });
                  }}
                  onDragEnd={() => setDragLinkIndex(null)}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{link.name}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{link.url}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      onClick={() =>
                        updateDraft((draft) => {
                          draft[activeCategory] = moveInArray(draft[activeCategory] || [], index, index - 1);
                          return draft;
                        })
                      }
                      disabled={index === 0}
                      className="rounded-md border border-zinc-300 dark:border-zinc-600 px-2 py-1 text-xs disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() =>
                        updateDraft((draft) => {
                          draft[activeCategory] = moveInArray(draft[activeCategory] || [], index, index + 1);
                          return draft;
                        })
                      }
                      disabled={index === links.length - 1}
                      className="rounded-md border border-zinc-300 dark:border-zinc-600 px-2 py-1 text-xs disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <select
                      value={moveTargets[index] || activeCategory}
                      onChange={(event) =>
                        setMoveTargets((previous) => ({
                          ...previous,
                          [index]: event.target.value,
                        }))
                      }
                      className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-xs"
                    >
                      {categoryNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        updateDraft((draft) => {
                          const toCategory = moveTargets[index] || activeCategory;
                          if (toCategory === activeCategory) {
                            return draft;
                          }
                          const source = [...(draft[activeCategory] || [])];
                          const [picked] = source.splice(index, 1);
                          draft[activeCategory] = source;
                          draft[toCategory] = [...(draft[toCategory] || []), picked];
                          return draft;
                        })
                      }
                      className="rounded-md border border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 px-2 py-1 text-xs"
                    >
                      移动
                    </button>
                    <button
                      onClick={() =>
                        updateDraft((draft) => {
                          draft[activeCategory] = (draft[activeCategory] || []).filter((_, i) => i !== index);
                          return draft;
                        })
                      }
                      className="rounded-md border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-2 py-1 text-xs"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
