"use client";

import { motion, AnimatePresence } from "framer-motion";

type Variant = "info" | "error";

interface SnackbarProps {
  open: boolean;
  variant?: Variant;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  info: "bg-md-inverse-surface text-md-inverse-on-surface",
  error: "bg-md-error-container text-md-on-error-container",
};

export default function Snackbar({ open, variant = "info", children }: SnackbarProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          className={`rounded-md3-xs px-16dp py-12dp text-[0.875rem] ${variantClasses[variant]}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
