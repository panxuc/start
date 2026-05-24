"use client";

import { RefreshCw, Save, Undo2 } from "lucide-react";

interface TokenAuthProps {
  tokenInput: string;
  setTokenInput: (value: string) => void;
  loading: boolean;
  canEdit: boolean;
  saving: boolean;
  isDirty: boolean;
  onLoad: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

export default function TokenAuth({
  tokenInput,
  setTokenInput,
  loading,
  canEdit,
  saving,
  isDirty,
  onLoad,
  onSave,
  onDiscard,
}: TokenAuthProps) {
  const statusText = canEdit ? (isDirty ? "未保存" : "已同步") : "未加载";

  return (
    <section className="paper-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          type="password"
          value={tokenInput}
          onChange={(event) => setTokenInput(event.target.value)}
          placeholder="NAVIGATION_ADMIN_TOKEN"
          className="paper-input flex-1 font-mono text-sm"
        />
        <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
          <button type="button" className="paper-button" onClick={onLoad} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            {loading ? "加载中..." : "加载"}
          </button>
          <button
            type="button"
            className="paper-button secondary"
            onClick={onSave}
            disabled={!canEdit || saving || !isDirty}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            type="button"
            className="paper-button ghost"
            onClick={onDiscard}
            disabled={!canEdit || saving || !isDirty}
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            撤销
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-5 text-stone">
        <span>Token 仅保存在浏览器 LocalStorage</span>
        <span>Ctrl/Cmd+S 保存，Esc 撤销</span>
        <span className={isDirty ? "text-danger-fg" : canEdit ? "text-ink" : "text-stone"}>
          {statusText}
        </span>
      </div>
    </section>
  );
}
