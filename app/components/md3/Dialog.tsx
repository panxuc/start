"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Dialog({
  open,
  title,
  description,
  confirmLabel = "确认",
  destructive = false,
  onConfirm,
  onCancel,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onClose = () => { if (open) onCancel(); };
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <dialog
          ref={dialogRef}
          className="
            fixed inset-0 z-[100] p-0 bg-transparent
            backdrop:bg-md-scrim/40 backdrop:backdrop-blur-[2px]
            open:flex items-center justify-center
          "
          onClick={(e) => { if (e.target === dialogRef.current) onCancel(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="
              rounded-md3-xl bg-md-surface-container-high shadow-md3-3
              p-24dp max-w-[360px] w-full
            "
          >
            <h3 className="text-[1.375rem] font-normal text-md-on-surface mb-12dp">{title}</h3>
            {description && (
              <p className="text-[0.875rem] text-md-on-surface-variant mb-24dp">{description}</p>
            )}
            <div className="flex justify-end gap-8dp">
              <Button variant="text" onClick={onCancel}>取消</Button>
              <Button
                variant={destructive ? "filled" : "filled-tonal"}
                onClick={onConfirm}
                className={destructive ? "bg-md-error text-md-on-error" : ""}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </dialog>
      )}
    </AnimatePresence>
  );
}
