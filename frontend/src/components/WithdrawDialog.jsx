import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

/**
 * Withdraw Application confirmation modal.
 * Uses framer-motion for animations and standard portal rendering.
 */
export default function WithdrawDialog({ open, onClose, onConfirm }) {
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
            key="withdraw-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/40"
            style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          />

          {/* Dialog */}
          <motion.div
            key="withdraw-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white border border-zinc-200 shadow-xl p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Warning Icon */}
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" strokeWidth={2} />
              </div>

              {/* Title */}
              <h2 className="font-display text-lg font-bold text-slate-900">
                Withdraw Application?
              </h2>

              {/* Message */}
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Are you sure you want to withdraw your application? This action cannot be undone.
              </p>

              {/* Actions */}
              <div className="mt-6 flex items-center gap-3">
                {/* No — Green button */}
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 shadow-sm cursor-pointer"
                >
                  No
                </button>
                {/* Yes, Withdraw — Red button */}
                <button
                  onClick={onConfirm}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 shadow-sm cursor-pointer"
                >
                  Yes, Withdraw
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
