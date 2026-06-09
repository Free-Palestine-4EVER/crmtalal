"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Select, Input, Textarea } from "@/components/ui/form";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useUsersByRole } from "@/lib/hooks/data";
import { useI18n } from "@/i18n";
import { apiFetch } from "@/lib/api";
import {
  STATUS_FLOW,
  METHODS,
  type Project,
  type ProjectStatus,
} from "@/lib/types";

const ALL_STATUSES: ProjectStatus[] = [...STATUS_FLOW, "rejected", "cancelled"];

export function RequestActions({ project }: { project: Project }) {
  const { dict: d } = useI18n();
  const { profile, role } = useAuth();
  const isAdmin = role === "admin";
  const isAssigned = role === "employee" && project.assignedTo === profile?.uid;
  const canStaff = isAdmin || isAssigned;
  const { data: valuers } = useUsersByRole("employee");
  const [busy, setBusy] = useState<string | null>(null);
  const [value, setValue] = useState(project.estimatedValue?.toString() ?? "");
  const [fee, setFee] = useState(project.fee?.toString() ?? "");
  const [note, setNote] = useState("");

  if (!canStaff) return null;

  const act = async (body: Record<string, unknown>, key: string) => {
    setBusy(key);
    try {
      await apiFetch(`/api/projects/${project.id}`, { body });
      toast.success(d.common.saved);
      if (key === "note") setNote("");
    } catch (e) {
      toast.error((e as Error)?.message || d.common.error);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{d.common.actions}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <Field label={d.common.status}>
          <Select
            value={project.status}
            disabled={busy !== null}
            onChange={(e) =>
              act({ action: "status", status: e.target.value }, "status")
            }
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {d.status[s]}
              </option>
            ))}
          </Select>
        </Field>

        {isAdmin && (
          <Field label={d.project.assignTo}>
            <Select
              value={project.assignedTo ?? ""}
              disabled={busy !== null}
              onChange={(e) => {
                const v = valuers.find((u) => u.uid === e.target.value);
                if (v)
                  act(
                    {
                      action: "assign",
                      employeeUid: v.uid,
                      employeeName: v.name,
                    },
                    "assign",
                  );
              }}
            >
              <option value="">{d.project.unassigned}</option>
              {valuers.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field label={d.project.method}>
          <Select
            value={project.method ?? ""}
            disabled={busy !== null}
            onChange={(e) =>
              act({ action: "update", fields: { method: e.target.value } }, "method")
            }
          >
            <option value="">{d.common.selectPlaceholder}</option>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {d.methods[m]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={`${d.project.estimatedValue} (${d.project.currency})`}>
          <div className="flex gap-2">
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Button
              variant="subtle"
              onClick={() =>
                act(
                  { action: "update", fields: { estimatedValue: Number(value) } },
                  "value",
                )
              }
              loading={busy === "value"}
            >
              {d.common.save}
            </Button>
          </div>
        </Field>

        {isAdmin && (
          <Field label={`${d.project.fee} (${d.project.currency})`}>
            <div className="flex gap-2">
              <Input
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
              <Button
                variant="subtle"
                onClick={() =>
                  act({ action: "update", fields: { fee: Number(fee) } }, "fee")
                }
                loading={busy === "fee"}
              >
                {d.common.save}
              </Button>
            </div>
          </Field>
        )}

        <Field label={d.project.addNote}>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={d.project.notePlaceholder}
            className="min-h-20"
          />
          <Button
            variant="subtle"
            size="sm"
            className="mt-2"
            onClick={() => note.trim() && act({ action: "note", note }, "note")}
            loading={busy === "note"}
          >
            {d.project.addNote}
          </Button>
        </Field>
      </CardBody>
    </Card>
  );
}
