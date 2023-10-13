"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, TextField } from "../md3";
import type { SiteSettings } from "../../lib/site-settings";

interface SiteSettingsEditorProps {
  settings: SiteSettings;
  onUpdate: (patch: Partial<SiteSettings>) => void;
}

export default function SiteSettingsEditor({ settings, onUpdate }: SiteSettingsEditorProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
        style={{ overflow: "hidden" }}
      >
        <Card>
          <h2 className="text-[1rem] font-medium text-md-on-surface mb-16dp">站点信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12dp">
            <TextField label="网站名" value={settings.siteName} onChange={(e) => onUpdate({ siteName: e.target.value })} />
            <TextField label="Favicon URL" value={settings.faviconUrl} onChange={(e) => onUpdate({ faviconUrl: e.target.value })} placeholder="/favicon.ico 或 https://..." />
            <TextField label="版权信息" value={settings.copyrightText} onChange={(e) => onUpdate({ copyrightText: e.target.value })} />
            <TextField label="备案号" value={settings.beianText} onChange={(e) => onUpdate({ beianText: e.target.value })} />
            <TextField label="备案链接" value={settings.beianUrl} onChange={(e) => onUpdate({ beianUrl: e.target.value })} className="md:col-span-2" />
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
