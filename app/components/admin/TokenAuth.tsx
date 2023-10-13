"use client";

import { Button, Card, TextField } from "../md3";

interface TokenAuthProps {
  tokenInput: string;
  setTokenInput: (v: string) => void;
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
  return (
    <Card>
      <div className="flex flex-col lg:flex-row gap-12dp lg:items-center">
        <TextField
          type="password"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="NAVIGATION_ADMIN_TOKEN"
          className="flex-1"
        />
        <div className="flex gap-8dp flex-shrink-0">
          <Button onClick={onLoad} disabled={loading}>
            {loading ? "加载中..." : "加载"}
          </Button>
          <Button variant="filled-tonal" onClick={onSave} disabled={!canEdit || saving || !isDirty}>
            {saving ? "保存中..." : "保存"}
          </Button>
          <Button variant="outlined" onClick={onDiscard} disabled={!canEdit || saving || !isDirty}>
            撤销
          </Button>
        </div>
      </div>
      <div className="mt-12dp text-[0.75rem] text-md-on-surface-variant flex items-center gap-12dp flex-wrap">
        <span>Token 仅保存在浏览器 LocalStorage</span>
        <span>快捷键: Ctrl/Cmd+S 保存, Ctrl/Cmd+Enter 添加, Esc 撤销</span>
        <span className={isDirty ? "text-md-error" : "text-md-primary"}>
          {isDirty ? "未保存" : "已同步"}
        </span>
      </div>
    </Card>
  );
}
