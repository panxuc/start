"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  MoreHorizontal,
  MoveRight,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { CategoryMap } from "../../config";

interface LinkListEditorProps {
  categories: CategoryMap;
  activeCategory: string;
  onUpdate: (updater: (draft: CategoryMap) => CategoryMap) => void;
  onRequestDeleteLink: (index: number) => void;
}

function moveInArray<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length) return items;
  const next = [...items];
  const [picked] = next.splice(from, 1);
  next.splice(to, 0, picked);
  return next;
}

function validateHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const menuItemClass =
  "w-full rounded px-3 py-2 text-left text-sm text-warm-dark transition-colors hover:bg-ink-tint hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";

export default function LinkListEditor({
  categories,
  activeCategory,
  onUpdate,
  onRequestDeleteLink,
}: LinkListEditorProps) {
  const categoryNames = Object.keys(categories);
  const links = categories[activeCategory] ?? [];

  const [addName, setAddName] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingUrl, setEditingUrl] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [menuMoveTarget, setMenuMoveTarget] = useState(activeCategory);

  useEffect(() => {
    setOpenMenuIndex(null);
    setMenuMoveTarget(activeCategory);
    setEditingIndex(null);
    setEditingName("");
    setEditingUrl("");
  }, [activeCategory]);

  function reportDraftError(message: string) {
    onUpdate(() => {
      throw new Error(message);
    });
  }

  function isDuplicateUrl(url: string, ignoredIndex?: number): boolean {
    return links.some((item, index) => index !== ignoredIndex && item.url.trim() === url);
  }

  function startEditing(index: number) {
    const target = links[index];
    if (!target) return;
    setOpenMenuIndex(null);
    setEditingIndex(index);
    setEditingName(target.name);
    setEditingUrl(target.url);
  }

  function cancelEditing() {
    setEditingIndex(null);
    setEditingName("");
    setEditingUrl("");
  }

  function saveEditing() {
    if (editingIndex === null) return;
    const name = editingName.trim();
    const url = editingUrl.trim();

    if (!name) {
      reportDraftError("请输入网址名称");
      return;
    }

    if (!validateHttpUrl(url)) {
      reportDraftError("请输入 http(s) 开头的网址");
      return;
    }

    if (isDuplicateUrl(url, editingIndex)) {
      reportDraftError("当前分类已存在相同网址");
      return;
    }

    onUpdate((draft) => {
      const nextLinks = [...(draft[activeCategory] || [])];
      if (!nextLinks[editingIndex]) return draft;
      nextLinks[editingIndex] = { ...nextLinks[editingIndex], name, url };
      draft[activeCategory] = nextLinks;
      return draft;
    });
    cancelEditing();
  }

  function addLink() {
    const name = addName.trim();
    const url = addUrl.trim();

    if (!name) {
      reportDraftError("请输入网址名称");
      return;
    }

    if (!validateHttpUrl(url)) {
      reportDraftError("请输入 http(s) 开头的网址");
      return;
    }

    if (isDuplicateUrl(url)) {
      reportDraftError("当前分类已存在相同网址");
      return;
    }

    onUpdate((draft) => {
      draft[activeCategory] = [...(draft[activeCategory] || []), { name, url }];
      return draft;
    });
    setAddName("");
    setAddUrl("");
  }

  function moveLink(index: number, to: number) {
    onUpdate((draft) => {
      draft[activeCategory] = moveInArray(draft[activeCategory] || [], index, to);
      return draft;
    });
    setOpenMenuIndex(null);
  }

  function moveLinkToCategory(index: number) {
    onUpdate((draft) => {
      const targetCategory = menuMoveTarget || activeCategory;
      if (targetCategory === activeCategory) return draft;
      const sourceLinks = [...(draft[activeCategory] || [])];
      const [picked] = sourceLinks.splice(index, 1);
      if (!picked) return draft;
      if ((draft[targetCategory] || []).some((item) => item.url === picked.url)) {
        throw new Error("目标分类已存在相同网址");
      }
      draft[activeCategory] = sourceLinks;
      draft[targetCategory] = [...(draft[targetCategory] || []), picked];
      return draft;
    });
    setOpenMenuIndex(null);
  }

  function toggleMenu(index: number) {
    setEditingIndex(null);
    setMenuMoveTarget(activeCategory);
    setOpenMenuIndex((previous) => (previous === index ? null : index));
  }

  function handleAddKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      addLink();
    }
  }

  return (
    <section className="paper-card p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="truncate text-lg font-semibold text-near-black">
          {activeCategory || "未选择分类"}
        </h2>
        <span className="paper-tag shrink-0">{links.length} 条</span>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-[200px_1fr_auto]">
        <input
          value={addName}
          onChange={(event) => setAddName(event.target.value)}
          onKeyDown={handleAddKeyDown}
          placeholder="名称"
          className="paper-input text-sm"
        />
        <input
          value={addUrl}
          onChange={(event) => setAddUrl(event.target.value)}
          onKeyDown={handleAddKeyDown}
          placeholder="https://example.com"
          className="paper-input font-mono text-sm"
        />
        <button type="button" className="paper-button" onClick={addLink}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          添加
        </button>
      </div>

      <div className="no-scrollbar max-h-[620px] overflow-auto rounded-md border border-paper-border-soft bg-parchment/50">
        {links.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-stone">当前分类暂无网址</div>
        )}

        {links.map((link, index) => (
          <div
            key={`${link.url}-${index}`}
            className={`relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors ${
              index < links.length - 1 ? "border-b border-paper-border-soft" : ""
            } ${dragIndex === index ? "bg-ink-tint" : "hover:bg-ivory"}`}
            draggable={editingIndex !== index}
            onDragStart={(event) => {
              if (editingIndex === index) return;
              setDragIndex(index);
              setOpenMenuIndex(null);
              event.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (dragIndex === null || dragIndex === index) return;
              moveLink(dragIndex, index);
            }}
            onDragEnd={() => setDragIndex(null)}
          >
            {editingIndex === index ? (
              <div className="grid min-w-0 grid-cols-1 gap-2">
                <input
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  placeholder="名称"
                  className="paper-input min-h-9 py-2 text-sm"
                />
                <input
                  value={editingUrl}
                  onChange={(event) => setEditingUrl(event.target.value)}
                  placeholder="https://example.com"
                  className="paper-input min-h-9 py-2 font-mono text-xs"
                />
              </div>
            ) : (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-near-black">{link.name}</div>
                <div className="mt-1 truncate font-mono text-xs text-stone">{link.url}</div>
              </div>
            )}

            {editingIndex === index ? (
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <button
                  type="button"
                  className="paper-button min-h-0 px-3 py-1 text-xs"
                  onClick={saveEditing}
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  保存
                </button>
                <button
                  type="button"
                  className="paper-button ghost min-h-0 px-2 py-1 text-xs"
                  onClick={cancelEditing}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  取消
                </button>
              </div>
            ) : (
              <div className="relative flex items-center justify-end">
                <button
                  type="button"
                  aria-label={`${link.name} 的更多操作`}
                  aria-haspopup="menu"
                  aria-expanded={openMenuIndex === index}
                  className="paper-button ghost h-8 min-h-0 w-8 px-0 py-0"
                  onClick={() => toggleMenu(index)}
                >
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </button>

                {openMenuIndex === index && (
                  <div
                    role="menu"
                    className="paper-card absolute right-0 top-full z-30 mt-2 w-64 max-w-[calc(100vw-48px)] p-2 shadow-paper"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className={menuItemClass}
                      disabled={index === 0}
                      onClick={() => moveLink(index, index - 1)}
                    >
                      <ArrowUp className="mr-2 inline h-4 w-4" aria-hidden="true" />
                      上移
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className={menuItemClass}
                      disabled={index === links.length - 1}
                      onClick={() => moveLink(index, index + 1)}
                    >
                      <ArrowDown className="mr-2 inline h-4 w-4" aria-hidden="true" />
                      下移
                    </button>

                    <div className="my-2 h-px bg-paper-border-soft" />
                    <label className="mb-1 block text-xs font-semibold text-olive">
                      移动到分类
                    </label>
                    <select
                      value={menuMoveTarget}
                      onChange={(event) => setMenuMoveTarget(event.target.value)}
                      className="paper-input min-h-0 py-1 pr-7 text-xs"
                    >
                      {categoryNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      role="menuitem"
                      className={`${menuItemClass} mt-1`}
                      disabled={menuMoveTarget === activeCategory}
                      onClick={() => moveLinkToCategory(index)}
                    >
                      <MoveRight className="mr-2 inline h-4 w-4" aria-hidden="true" />
                      移动
                    </button>

                    <div className="my-2 h-px bg-paper-border-soft" />
                    <button
                      type="button"
                      role="menuitem"
                      className={menuItemClass}
                      onClick={() => startEditing(index)}
                    >
                      <Pencil className="mr-2 inline h-4 w-4" aria-hidden="true" />
                      编辑
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className={`${menuItemClass} text-danger-fg hover:text-danger-fg`}
                      onClick={() => {
                        setOpenMenuIndex(null);
                        onRequestDeleteLink(index);
                      }}
                    >
                      <Trash2 className="mr-2 inline h-4 w-4" aria-hidden="true" />
                      删除
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
