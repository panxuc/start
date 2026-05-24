"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import type { CategoryMap } from "../../config";

interface CategorySidebarProps {
  categories: CategoryMap;
  activeCategory: string;
  onSetActive: (name: string) => void;
  onUpdate: (updater: (draft: CategoryMap) => CategoryMap) => void;
  onRequestDeleteCategory: (name: string) => void;
}

function moveInArray<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length) return items;
  const next = [...items];
  const [picked] = next.splice(from, 1);
  next.splice(to, 0, picked);
  return next;
}

export default function CategorySidebar({
  categories,
  activeCategory,
  onSetActive,
  onUpdate,
  onRequestDeleteCategory,
}: CategorySidebarProps) {
  const names = Object.keys(categories);
  const activeIndex = names.indexOf(activeCategory);
  const [newName, setNewName] = useState("");
  const [renameName, setRenameName] = useState(activeCategory);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    setRenameName(activeCategory);
  }, [activeCategory]);

  return (
    <section className="paper-card p-4">
      <h2 className="mb-3 text-base font-semibold text-near-black">分类</h2>

      <div className="no-scrollbar flex max-h-[520px] flex-col gap-1 overflow-auto">
        {names.map((name, index) => {
          const isActive = name === activeCategory;
          return (
            <div
              key={name}
              className={`rounded-md transition-colors ${
                dragIndex === index ? "bg-ink-tint" : ""
              }`}
              draggable
              onDragStart={(event) => {
                setDragIndex(index);
                event.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (dragIndex === null || dragIndex === index) return;
                onUpdate((draft) => Object.fromEntries(moveInArray(Object.entries(draft), dragIndex, index)));
              }}
              onDragEnd={() => setDragIndex(null)}
            >
              <button
                type="button"
                onClick={() => onSetActive(name)}
                className={`w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-ink text-ivory"
                    : "text-warm-dark hover:bg-ink-tint hover:text-ink"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate">{name}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-[0.68rem] leading-none ${
                      isActive ? "bg-ivory/20 text-ivory" : "bg-ink-tint text-ink"
                    }`}
                  >
                    {(categories[name] || []).length}
                  </span>
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="my-4 h-px bg-paper-border-soft" />

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              onUpdate((draft) =>
                Object.fromEntries(moveInArray(Object.entries(draft), activeIndex, activeIndex - 1))
              )
            }
            disabled={activeIndex <= 0}
            className="paper-button ghost min-h-0 px-2 py-1 text-xs"
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
            上移
          </button>
          <button
            type="button"
            onClick={() =>
              onUpdate((draft) =>
                Object.fromEntries(moveInArray(Object.entries(draft), activeIndex, activeIndex + 1))
              )
            }
            disabled={activeIndex < 0 || activeIndex >= names.length - 1}
            className="paper-button ghost min-h-0 px-2 py-1 text-xs"
          >
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
            下移
          </button>
        </div>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="新分类"
            className="paper-input min-h-9 flex-1 py-2 text-sm"
          />
          <button
            type="button"
            className="paper-button px-3 text-sm"
            onClick={() => {
              const name = newName.trim();
              onUpdate((draft) => {
                if (!name) throw new Error("请输入分类名");
                if (draft[name]) throw new Error("分类已存在");
                draft[name] = [];
                return draft;
              });
              setNewName("");
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            添加
          </button>
        </div>
        <div className="flex gap-2">
          <input
            value={renameName}
            onChange={(event) => setRenameName(event.target.value)}
            placeholder="重命名"
            className="paper-input min-h-9 flex-1 py-2 text-sm"
          />
          <button
            type="button"
            className="paper-button secondary px-3 text-sm"
            onClick={() => {
              const nextName = renameName.trim();
              onUpdate((draft) => {
                if (!nextName || !activeCategory) throw new Error("请输入新的分类名");
                if (!draft[activeCategory]) return draft;
                if (nextName !== activeCategory && draft[nextName]) {
                  throw new Error("目标分类名已存在");
                }

                const entries = Object.entries(draft).map(([key, value]) =>
                  key === activeCategory ? ([nextName, value] as [string, typeof value]) : ([key, value] as [string, typeof value])
                );
                onSetActive(nextName);
                return Object.fromEntries(entries);
              });
            }}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            重命名
          </button>
        </div>
        <button
          type="button"
          className="paper-button danger"
          disabled={!activeCategory || Object.keys(categories).length <= 1}
          onClick={() => {
            if (!activeCategory) return;
            onRequestDeleteCategory(activeCategory);
          }}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          删除当前分类
        </button>
      </div>
    </section>
  );
}
