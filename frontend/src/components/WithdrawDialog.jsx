import { AlertTriangle } from "lucide-react";
import ConfirmDialog from "./ui/ConfirmDialog";

/**
 * Withdraw Application confirmation modal.
 * Thin wrapper around ConfirmDialog with withdraw-specific copy & styling.
 * API unchanged — same (open, onClose, onConfirm) props.
 */
export default function WithdrawDialog({ open, onClose, onConfirm }) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      icon={AlertTriangle}
      variant="warning"
      title="Withdraw Application?"
      message="Are you sure you want to withdraw your application? This action cannot be undone."
      cancelLabel="No"
      confirmLabel="Yes, Withdraw"
    />
  );
}
