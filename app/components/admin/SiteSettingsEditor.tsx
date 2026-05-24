"use client";

import type { SiteSettings } from "../../lib/site-settings";

interface SiteSettingsEditorProps {
  settings: SiteSettings;
  onUpdate: (patch: Partial<SiteSettings>) => void;
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-olive">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="paper-input text-sm"
      />
    </label>
  );
}

export default function SiteSettingsEditor({ settings, onUpdate }: SiteSettingsEditorProps) {
  return (
    <section className="paper-card p-4">
      <h2 className="mb-4 text-lg font-semibold text-near-black">站点信息</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field
          label="网站名"
          value={settings.siteName}
          onChange={(value) => onUpdate({ siteName: value })}
        />
        <Field
          label="Favicon URL"
          value={settings.faviconUrl}
          placeholder="/favicon.ico 或 https://..."
          onChange={(value) => onUpdate({ faviconUrl: value })}
        />
        <Field
          label="版权信息"
          value={settings.copyrightText}
          onChange={(value) => onUpdate({ copyrightText: value })}
        />
        <Field
          label="备案号"
          value={settings.beianText}
          onChange={(value) => onUpdate({ beianText: value })}
        />
        <Field
          label="备案链接"
          value={settings.beianUrl}
          onChange={(value) => onUpdate({ beianUrl: value })}
          className="md:col-span-2"
        />
      </div>
    </section>
  );
}
