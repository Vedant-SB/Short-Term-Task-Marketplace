import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

/**
 * Generic confirmation dialog.
 *
 * Extracted from WithdrawDialog / LogoutDialog — both shared the identical
 * portal + AnimatePresence + scroll-lock + Escape-key pattern.
 *
 * @param {boolean}   open          Whether the dialog is visible
 * @param {Function}  onClose       Called when the user cancels / presses Escape
 * @param {Function}  onConfirm     Called when the user clicks the confirm button
 * @param {string}    title         Dialog heading
 * @param {string}    message       Explanatory body text
 * @param {string}    [confirmLabel="Confirm"]  Label for the confirm button
 * @param {string}    [cancelLabel="Cancel"]    Label for the cancel button
 * @param {Component} [icon=AlertTriangle]       Lucide icon component
 * @param {"danger"|"warning"} [variant="danger"] Controls icon bg + confirm-button colour
 */

const VARIANT_STYLES = {
  danger: {
    iconWrap: "bg-destructive/10",
    iconColor: "text-destructive",
    confirmBtn:
      "bg-destructive text-destructive-foreground shadow-elegant hover:-translate-y-0.5",
  },
  warning: {
    iconWrap: "bg-amber-100",
    iconColor: "text-amber-600",
    confirmBtn:
      "bg-amber-600 text-white shadow-sm hover:bg-amber-700",
  },
  primary: {
    iconWrap: "bg-primary/10",
    iconColor: "text-primary",
    confirmBtn:
      "bg-primary text-primary-foreground shadow-elegant hover:-translate-y-0.5",
  },
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  icon: Icon = AlertTriangle,
  variant = "danger",
}) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.danger;

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
            key="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-ink/30"
            style={{
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          />

          {/* Dialog */}
          <motion.div
            key="confirm-dialog"
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
              <div
                className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${styles.iconWrap}`}
              >
                <Icon
                  className={`h-5 w-5 ${styles.iconColor}`}
                  strokeWidth={2}
                />
              </div>

              {/* Title */}
              <h2 className="text-center font-display text-lg font-semibold text-ink">
                {title}
              </h2>

              {/* Message */}
              {message && (
                <p className="mt-2 text-center text-sm text-muted-foreground leading-relaxed">
                  {message}
                </p>
              )}

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface cursor-pointer"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-transform cursor-pointer ${styles.confirmBtn}`}
                >
                  {confirmLabel}
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
