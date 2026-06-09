"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  MoreVertical,
  Pencil,
  Trash2,
  CalendarClock,
  ArrowRightLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useI18n } from "@/i18n";
import { useAuth } from "@/lib/auth/AuthProvider";
import { apiFetch } from "@/lib/api";
import { fmtMoney, fmtDate } from "@/lib/format";
import { DEAL_STAGES, type Deal, type DealStage } from "@/lib/types";
import { DEAL_STAGE_LABEL } from "./dealEnums";

export function DealCard({
  deal,
  onEdit,
}: {
  deal: Deal;
  onEdit: (d: Deal) => void;
}) {
  const { dict: d, locale, L } = useI18n();
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const move = async (stage: DealStage) => {
    if (stage === deal.stage) return;
    setBusy(true);
    try {
      await apiFetch("/api/crm", {
        body: { entity: "deals", op: "update", id: deal.id, data: { stage } },
      });
      toast.success(
        L({
          ar: `نُقلت إلى ${L(DEAL_STAGE_LABEL[stage])}`,
          en: `Moved to ${L(DEAL_STAGE_LABEL[stage])}`,
        }),
      );
    } catch {
      toast.error(d.common.error);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await apiFetch("/api/crm", {
        body: { entity: "deals", op: "delete", id: deal.id },
      });
      toast.success(d.common.success);
      setConfirmOpen(false);
    } catch {
      toast.error(d.common.error);
    } finally {
      setBusy(false);
    }
  };

  // Move targets (all stages except the current one), then edit, then delete.
  const items: DropdownItem[] = [
    ...DEAL_STAGES.filter((s) => s !== deal.stage).map<DropdownItem>((s) => ({
      key: `move-${s}`,
      label: (
        <span className="flex items-center gap-2">
          <ArrowRightLeft className="h-3.5 w-3.5 text-ink-500" />
          {L(DEAL_STAGE_LABEL[s])}
        </span>
      ),
      onClick: () => move(s),
    })),
    {
      key: "edit",
      label: d.common.edit,
      icon: Pencil,
      onClick: () => onEdit(deal),
    },
    ...(isAdmin
      ? [
          {
            key: "delete",
            label: d.common.delete,
            icon: Trash2,
            danger: true,
            onClick: () => setConfirmOpen(true),
          } satisfies DropdownItem,
        ]
      : []),
  ];

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: busy ? 0.55 : 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="group rounded-xl border border-ink-700/80 bg-ink-850/80 p-3 shadow-card transition-colors hover:border-gold-500/30"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1 text-sm font-semibold leading-snug text-cream-50">
            {deal.title}
          </p>
          <Dropdown
            align="end"
            trigger={
              <span className="-me-1 grid h-7 w-7 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-white/5 hover:text-parch-50">
                <MoreVertical className="h-4 w-4" />
              </span>
            }
            items={items}
          />
        </div>

        <p className="mt-1 truncate text-xs text-ink-500">{deal.clientName}</p>

        {deal.value != null && (
          <p className="nums mt-2.5 text-sm font-semibold text-gold-300">
            {fmtMoney(deal.value, locale)}
          </p>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-ink-800/70 pt-2.5">
          {deal.ownerName ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <Avatar name={deal.ownerName} size="sm" className="h-6 w-6 text-[0.6rem]" />
              <span className="truncate text-[0.7rem] text-ink-500">
                {deal.ownerName}
              </span>
            </span>
          ) : (
            <span className="text-[0.7rem] text-ink-600">
              {L({ ar: "بلا مالك", en: "No owner" })}
            </span>
          )}
          {deal.expectedCloseAt && (
            <span className="flex shrink-0 items-center gap-1 text-[0.7rem] text-ink-500">
              <CalendarClock className="h-3 w-3" />
              {fmtDate(deal.expectedCloseAt, locale)}
            </span>
          )}
        </div>
      </motion.div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={remove}
        danger
        loading={busy}
        title={d.common.delete}
        message={L({
          ar: `سيتم حذف "${deal.title}" نهائيًا.`,
          en: `"${deal.title}" will be permanently deleted.`,
        })}
        confirmLabel={d.common.delete}
      />
    </>
  );
}
