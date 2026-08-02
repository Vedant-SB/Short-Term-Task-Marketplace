import { LogOut } from "lucide-react";
import ConfirmDialog from "./ui/ConfirmDialog";

/**
 * Logout confirmation modal.
 * Thin wrapper around ConfirmDialog with logout-specific copy & styling.
 * API unchanged — same (open, onClose, onConfirm) props.
 */
export default function LogoutDialog({ open, onClose, onConfirm }) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      icon={LogOut}
      variant="danger"
      title="Log out?"
      message="Are you sure you want to log out of your account?"
      cancelLabel="Cancel"
      confirmLabel="Logout"
    />
  );
}
