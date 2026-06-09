"use client";

import { useDict } from "@/i18n";
import { Button } from "./Button";
import { Modal } from "./Modal";

export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: React.ReactNode;
  message?: React.ReactNode;
  /** Overrides the dictionary default (common.confirm). */
  confirmLabel?: string;
  /** Overrides the dictionary default (common.cancel). */
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger,
  loading,
}: ConfirmDialogProps) {
  const dict = useDict();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel ?? dict.common.cancel}
          </Button>
          <Button
            variant={danger ? "danger" : "gold"}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel ?? dict.common.confirm}
          </Button>
        </>
      }
    >
      {message && <p className="text-sm text-parch-100/80">{message}</p>}
    </Modal>
  );
}
