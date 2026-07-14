import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";

/**
 * Logout confirmation modal.
 * Uses framer-motion for animations and the existing design-system tokens.
 * Rendered via React portal so it layers above everything.
 */
export default function LogoutDialog({ open, onClose, onConfirm }) {
  /* Lock body scroll while open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="logout-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-ink/30"
            style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          />

          {/* Dialog */}
          <motion.div
            key="logout-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-lift p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <LogOut className="h-5 w-5 text-destructive" />
              </div>

              {/* Title */}
              <h2 className="text-center font-display text-lg font-semibold text-ink">
                Log out?
              </h2>

              {/* Message */}
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Are you sure you want to log out of your account?
              </p>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 rounded-full bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground shadow-elegant transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
