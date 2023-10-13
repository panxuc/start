"use client";

import React from "react";
import { Button, Card, TextField } from "../md3";
import type { CategoryMap } from "../../config";

interface CategorySidebarProps {
  categories: CategoryMap;
  activeCategory: string;
  onSetActive: (name: string) => void;
  onUpdate: (updater: (draft: CategoryMap) => CategoryMap) => void;
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
}: CategorySidebarProps) {
  const names = Object.keys(categories);
  const [newName, setNewName] = React.useState("");
  const [renameName, setRenameName] = React.useState(activeCategory);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);

  React.useEffect(() => { setRenameName(activeCategory); }, [activeCategory]);

  return (
    <Card className="!p-16dp">
      <h2 className="text-[0.875rem] font-medium text-md-on-surface px-4dp mb-12dp">分类</h2>

      <div className="max-h-[520px] overflow-auto no-scrollbar flex flex-col gap-4dp">
        {names.map((name, index) => {
          const isActive = name === activeCategory;
          return (
            <div
              key={name}
              className={`grid grid-cols-[1fr_auto_auto] gap-4dp rounded-md3-sm transition-colors ${dragIndex === index ? "bg-md-secondary-container/50" : ""}`}
              draggable
              onDragStart={(e) => { setDragIndex(index); e.dataTransfer.effectAllowed = "move"; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex === null || dragIndex === index) return;
                onUpdate((d) => Object.fromEntries(moveInArray(Object.entries(d), dragIndex, index)));
              }}
              onDragEnd={() => setDragIndex(null)}
            >
              <button
                onClick={() => onSetActive(name)}
                className={`text-left rounded-md3-sm px-12dp py-12dp text-[0.875rem] transition-all duration-md3-s4 ease-md3-standard ${
                  isActive ? "bg-md-secondary-container text-md-on-secondary-container" : "text-md-on-surface hover:bg-md-surface-container-high"
                }`}
              >
                <span className="flex items-center justify-between gap-8dp">
                  <span className="truncate">{name}</span>
                  <span className="shrink-0 rounded-md3-xs bg-md-surface-container-highest px-8dp py-4dp text-[10px] leading-none text-md-on-surface-variant">
                    {(categories[name] || []).length}
                  </span>
                </span>
              </button>
              <button onClick={() => onUpdate((d) => Object.fromEntries(moveInArray(Object.entries(d), index, index - 1)))} disabled={index === 0}
                className="rounded-md3-sm bg-md-surface-container-high px-8dp text-xs disabled:opacity-40 text-md-on-surface transition-colors">↑</button>
              <button onClick={() => onUpdate((d) => Object.fromEntries(moveInArray(Object.entries(d), index, index + 1)))} disabled={index === names.length - 1}
                className="rounded-md3-sm bg-md-surface-container-high px-8dp text-xs disabled:opacity-40 text-md-on-surface transition-colors">↓</button>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-md-surface-container-highest my-12dp" />

      <div className="flex flex-col gap-8dp">
        <div className="flex gap-8dp">
          <TextField value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="新分类" className="flex-1 !py-10dp" />
          <Button size="small" onClick={() => {
            const n = newName.trim(); if (!n) return;
            onUpdate((d) => { if (d[n]) throw new Error("分类已存在"); d[n] = []; return d; });
            setNewName("");
          }}>添加</Button>
        </div>
        <div className="flex gap-8dp">
          <TextField value={renameName} onChange={(e) => setRenameName(e.target.value)} placeholder="重命名" className="flex-1 !py-10dp" />
          <Button variant="outlined" size="small" onClick={() => {
            const next = renameName.trim(); if (!next || !activeCategory) return;
            onUpdate((d) => {
              if (!d[activeCategory]) return d;
              if (next !== activeCategory && d[next]) throw new Error("目标分类名已存在");
              const entries = Object.entries(d).map(([k, v]) => k === activeCategory ? [next, v] as [string, typeof v] : [k, v] as [string, typeof v]);
              onSetActive(next);
              return Object.fromEntries(entries);
            });
          }}>重命名</Button>
        </div>
        <Button variant="filled" onClick={() => onUpdate((d) => {
          if (!activeCategory || !d[activeCategory]) return d;
          if (Object.keys(d).length <= 1) throw new Error("至少保留一个分类");
          delete d[activeCategory]; return d;
        })} className="!bg-md-error-container !text-md-on-error-container">
          删除当前分类
        </Button>
      </div>
    </Card>
  );
}
