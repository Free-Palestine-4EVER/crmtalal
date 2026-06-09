"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { FileUpload, type UploadedFile } from "@/components/portal/FileUpload";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useI18n } from "@/i18n";
import { apiFetch } from "@/lib/api";
import {
  PROPERTY_TYPES,
  PURPOSES,
  PRIORITIES,
  SAUDI_REGIONS,
} from "@/lib/types";

export default function NewRequestPage() {
  const { dict: d, L } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [docs, setDocs] = useState<UploadedFile[]>([]);
  const [form, setForm] = useState({
    title: "",
    propertyType: "land",
    purpose: "financing",
    region: "",
    city: "",
    district: "",
    address: "",
    area: "",
    description: "",
    priority: "normal",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const priorityLabel = (p: string) =>
    p === "normal"
      ? d.project.priorityNormal
      : p === "high"
        ? d.project.priorityHigh
        : d.project.priorityUrgent;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error(d.common.required);
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<{ id: string; code: string }>("/api/projects", {
        body: {
          ...form,
          area: form.area ? Number(form.area) : undefined,
          documents: docs,
        },
      });
      toast.success(d.project.requestSubmitted);
      router.push(`/requests/${res.id}`);
    } catch {
      toast.error(d.common.error);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        icon={FileText}
        title={d.project.createTitle}
        subtitle={d.project.createSubtitle}
      />
      <Card>
        <CardBody>
          <form onSubmit={submit} className="space-y-5">
            <Field label={d.project.title} required>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder={d.project.titlePlaceholder}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={d.project.propertyType} required>
                <Select
                  value={form.propertyType}
                  onChange={(e) => set("propertyType", e.target.value)}
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {d.propertyTypes[t]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={d.project.purpose} required>
                <Select
                  value={form.purpose}
                  onChange={(e) => set("purpose", e.target.value)}
                >
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {d.purposes[p]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={d.project.region}>
                <Select
                  value={form.region}
                  onChange={(e) => set("region", e.target.value)}
                >
                  <option value="">{d.common.selectPlaceholder}</option>
                  {SAUDI_REGIONS.map((r, i) => (
                    <option key={i} value={L(r)}>
                      {L(r)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={d.project.city}>
                <Input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </Field>
              <Field label={d.project.district}>
                <Input
                  value={form.district}
                  onChange={(e) => set("district", e.target.value)}
                />
              </Field>
              <Field label={`${d.project.area} (${d.project.sqm})`}>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.area}
                  onChange={(e) => set("area", e.target.value)}
                />
              </Field>
            </div>

            <Field label={d.project.address}>
              <Input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder={d.project.addressPlaceholder}
              />
            </Field>

            <Field label={d.project.priority}>
              <Select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {priorityLabel(p)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label={d.project.description}>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder={d.project.descriptionPlaceholder}
              />
            </Field>

            <Field label={d.project.documents} hint={d.project.documentsHint}>
              <FileUpload
                pathPrefix={`projects/incoming/${user?.uid}`}
                value={docs}
                onChange={setDocs}
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                {d.common.cancel}
              </Button>
              <Button type="submit" loading={submitting}>
                {d.project.submitRequest}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
