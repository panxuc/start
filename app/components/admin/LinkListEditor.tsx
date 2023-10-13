"use client";

import React, { useState } from "react";
import { Button, Card, TextField } from "../md3";
import type { CategoryMap } from "../../config";
import type { LinkItem } from "../../config";

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
  const [moveTargets, setMoveTargets] = useState<Record<number, string>>({});

  function startEditing(index: number) {
    const t = links[index]; if (!t) return;
    setEditingIndex(index); setEditingName(t.name); setEditingUrl(t.url);
  }

  function cancelEditing() { setEditingIndex(null); setEditingName(""); setEditingUrl(""); }

  function saveEditing() {
    if (editingIndex === null) return;
    const name = editingName.trim(), url = editingUrl.trim();
    if (!name || !url) return;
    onUpdate((d) => {
      const arr = [...(d[activeCategory] || [])];
      if (!arr[editingIndex]) return d;
      arr[editingIndex] = { ...arr[editingIndex], name, url };
      d[activeCategory] = arr; return d;
    });
    cancelEditing();
  }

  function addLink() {
    const name = addName.trim(), url = addUrl.trim();
    if (!name || !url) return;
    onUpdate((d) => { d[activeCategory] = [...(d[activeCategory] || []), { name, url }]; return d; });
    setAddName(""); setAddUrl("");
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-16dp">
        <h2 className="text-[1rem] font-medium text-md-on-surface">{activeCategory || "未选择分类"}</h2>
        <span className="text-[0.75rem] text-md-on-surface-variant">{links.length} 条</span>
      </div>

      {/* Add link */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-8dp mb-16dp">
        <TextField value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="名称" />
        <TextField value={addUrl} onChange={(e) => setAddUrl(e.target.value)} placeholder="https://example.com" />
        <Button onClick={addLink}>添加</Button>
      </div>

      {/* Links list */}
      <div className="max-h-[620px] overflow-auto no-scrollbar rounded-md3-sm bg-md-surface-container">
        {links.length === 0 && (
          <div className="px-16dp py-32dp text-center text-[0.875rem] text-md-on-surface-variant">当前分类暂无网址</div>
        )}
        {links.map((link, index) => (
          <div
            key={`${link.url}-${index}`}
            className={`grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8dp px-16dp py-12dp transition-colors ${
              index < links.length - 1 ? "border-b border-md-outline-variant" : ""
            } ${dragIndex === index ? "bg-md-secondary-container/50" : "hover:bg-md-surface-container-high"}`}
            draggable
            onDragStart={(e) => { setDragIndex(index); e.dataTransfer.effectAllowed = "move"; }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex === null || dragIndex === index) return;
              onUpdate((d) => { d[activeCategory] = moveInArray(d[activeCategory] || [], dragIndex, index); return d; });
            }}
            onDragEnd={() => setDragIndex(null)}
          >
            {editingIndex === index ? (
              <div className="min-w-0 grid grid-cols-1 gap-8dp">
                <TextField value={editingName} onChange={(e) => setEditingName(e.target.value)} placeholder="名称" className="!py-8dp" />
                <TextField value={editingUrl} onChange={(e) => setEditingUrl(e.target.value)} placeholder="https://example.com" className="!py-8dp !text-[0.75rem]" />
              </div>
            ) : (
              <div className="min-w-0">
                <div className="text-[0.875rem] font-medium truncate text-md-on-surface">{link.name}</div>
                <div className="text-[0.75rem] text-md-on-surface-variant truncate">{link.url}</div>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4dp">
              <button onClick={() => onUpdate((d) => { d[activeCategory] = moveInArray(d[activeCategory] || [], index, index - 1); return d; })} disabled={index === 0}
                className="rounded-md3-sm bg-md-surface-container-high px-8dp py-4dp text-xs disabled:opacity-40 text-md-on-surface transition-colors">↑</button>
              <button onClick={() => onUpdate((d) => { d[activeCategory] = moveInArray(d[activeCategory] || [], index, index + 1); return d; })} disabled={index === links.length - 1}
                className="rounded-md3-sm bg-md-surface-container-high px-8dp py-4dp text-xs disabled:opacity-40 text-md-on-surface transition-colors">↓</button>
              <select value={moveTargets[index] || activeCategory}
                onChange={(e) => setMoveTargets((p) => ({ ...p, [index]: e.target.value }))}
                className="rounded-md3-sm bg-md-surface-container-high px-8dp py-4dp text-xs text-md-on-surface outline-none">
                {categoryNames.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <Button variant="text" size="small" onClick={() => onUpdate((d) => {
                const to = moveTargets[index] || activeCategory; if (to === activeCategory) return d;
                const src = [...(d[activeCategory] || [])]; const [picked] = src.splice(index, 1);
                d[activeCategory] = src; d[to] = [...(d[to] || []), picked]; return d;
              })} className="!text-md-on-tertiary-container">移动</Button>
              <Button variant="text" size="small" onClick={() => editingIndex === index ? saveEditing() : startEditing(index)}>
                {editingIndex === index ? "保存" : "编辑"}
              </Button>
              {editingIndex === index && (
                <Button variant="text" size="small" onClick={cancelEditing}>取消</Button>
              )}
              <Button variant="text" size="small" onClick={() => onRequestDeleteLink(index)} className="!text-md-on-error-container">
                删除
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
