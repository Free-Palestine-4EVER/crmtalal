"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  FileCheck,
  User,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/form";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge, PriorityBadge } from "@/components/portal/StatusBadge";
import { StageProgress } from "@/components/portal/request/StageProgress";
import { RequestActions } from "@/components/portal/request/RequestActions";
import { RequestMessages } from "@/components/portal/request/RequestMessages";
import {
  MediaGallery,
  isImageDoc,
} from "@/components/portal/request/MediaGallery";
import { ValuationWorkspace } from "@/components/portal/request/ValuationWorkspace";
import { FileUpload, type UploadedFile } from "@/components/portal/FileUpload";
import { useProject } from "@/lib/hooks/data";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useI18n } from "@/i18n";
import { apiFetch } from "@/lib/api";
import { fmtMoney, fmtDate, fmtArea, timeAgo } from "@/lib/format";
import type { ReportType, TimelineEntry } from "@/lib/types";

function ReportUploader({ projectId }: { projectId: string }) {
  const { dict: d } = useI18n();
  const [type, setType] = useState<ReportType>("final");
  const attach = async (f: UploadedFile) => {
    try {
      await apiFetch(`/api/projects/${projectId}`, {
        body: { action: "report", report: { ...f, type } },
      });
      toast.success(d.common.saved);
    } catch {
      toast.error(d.common.error);
    }
  };
  return (
    <div className="space-y-2 border-t border-ink-800 pt-4">
      <Select
        value={type}
        onChange={(e) => setType(e.target.value as ReportType)}
      >
        <option value="draft">{d.project.draftReport}</option>
        <option value="final">{d.project.finalReport}</option>
        <option value="certificate">{d.project.certificate}</option>
      </Select>
      <FileUpload
        pathPrefix={`projects/${projectId}/reports`}
        value={[]}
        onChange={() => {}}
        onUploaded={attach}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-800/60 py-2.5 last:border-0">
      <span className="text-sm text-ink-500">{label}</span>
      <span className="text-end text-sm font-medium text-cream-50">{value}</span>
    </div>
  );
}

export default function RequestDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: p, loading } = useProject(id);
  const { dict: d, locale, isRTL } = useI18n();
  const { profile, role } = useAuth();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  if (!p) {
    return (
      <EmptyState
        icon={FileText}
        title={d.common.noResults}
        action={
          <Button href="/requests" variant="subtle" size="sm">
            {d.project.requests}
          </Button>
        }
      />
    );
  }

  const isOwner = p.clientId === profile?.uid;
  const isAdmin = role === "admin";
  const isAssigned = p.assignedTo === profile?.uid;
  const canStaff = isAdmin || (role === "employee" && isAssigned);
  const canUploadDoc = isOwner || canStaff;
  const Back = isRTL ? ChevronRight : ChevronLeft;

  const attachDoc = async (f: UploadedFile) => {
    try {
      await apiFetch(`/api/projects/${p.id}`, {
        body: { action: "document", document: f },
      });
      toast.success(d.common.saved);
    } catch {
      toast.error(d.common.error);
    }
  };

  const kindText = (e: TimelineEntry): string => {
    switch (e.kind) {
      case "created":
        return d.status.submitted;
      case "status":
        return e.status ? d.status[e.status] : d.common.status;
      case "assign":
        return `${d.project.assign} · ${e.note ?? ""}`;
      case "note":
        return e.note ?? "";
      case "document":
        return `${d.project.documents} · ${e.note ?? ""}`;
      case "report":
        return `${d.project.finalReport} · ${e.note ?? ""}`;
      case "fee":
        return `${d.project.fee} · ${e.note ?? ""}`;
      case "value":
        return `${d.project.estimatedValue} · ${e.note ?? ""}`;
      case "method":
        return `${d.project.method} · ${e.note ?? ""}`;
      default:
        return e.note ?? "";
    }
  };

  const locationParts = [p.district, p.city, p.region, p.address].filter(
    Boolean,
  );

  return (
    <div>
      {/* Header */}
      <Link
        href="/requests"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-500 transition-colors hover:text-gold-300"
      >
        <Back className="h-4 w-4" />
        {d.project.requests}
      </Link>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-ink-700 bg-ink-850/50 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-gold-400">{p.code}</span>
              <PriorityBadge priority={p.priority} />
            </div>
            <h1 className="mt-1 text-xl font-semibold text-cream-50 sm:text-2xl">
              {p.title}
            </h1>
          </div>
          <StatusBadge status={p.status} />
        </div>
        <div className="border-t border-ink-800 pt-4">
          <StageProgress status={p.status} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2">
          {/* Property details */}
          <Card>
            <CardHeader>
              <CardTitle>{d.project.propertyDetails}</CardTitle>
            </CardHeader>
            <CardBody>
              <DetailRow
                label={d.project.propertyType}
                value={d.propertyTypes[p.propertyType] ?? p.propertyType}
              />
              <DetailRow
                label={d.project.purpose}
                value={d.purposes[p.purpose] ?? p.purpose}
              />
              <DetailRow
                label={d.project.address}
                value={
                  locationParts.length ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gold-500" />
                      {locationParts.join("، ")}
                    </span>
                  ) : undefined
                }
              />
              <DetailRow label={d.project.area} value={fmtArea(p.area, locale)} />
              {p.method && (
                <DetailRow label={d.project.method} value={d.methods[p.method]} />
              )}
              {p.estimatedValue != null && (
                <DetailRow
                  label={d.project.estimatedValue}
                  value={
                    <span className="text-gold-300">
                      {fmtMoney(p.estimatedValue, locale)}
                    </span>
                  }
                />
              )}
              {p.fee != null && (
                <DetailRow label={d.project.fee} value={fmtMoney(p.fee, locale)} />
              )}
              {p.description && (
                <div className="border-t border-ink-800/60 pt-3">
                  <p className="text-sm text-ink-500">{d.project.description}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-cream-100/80">
                    {p.description}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {(canStaff || p.valuation) && (
            <ValuationWorkspace project={p} canEdit={canStaff} />
          )}

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>{d.project.documents}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {p.documents.length === 0 ? (
                <p className="text-sm text-ink-500">{d.project.noDocuments}</p>
              ) : (
                <div className="space-y-4">
                  <MediaGallery documents={p.documents} />
                  {p.documents.some((doc) => !isImageDoc(doc)) && (
                    <ul className="space-y-2">
                      {p.documents
                        .filter((doc) => !isImageDoc(doc))
                        .map((doc) => (
                          <li key={doc.id}>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-850/50 px-3 py-2.5 transition-colors hover:border-gold-500/30"
                            >
                              <Paperclip className="h-4 w-4 shrink-0 text-gold-400" />
                              <span className="min-w-0 flex-1 truncate text-sm text-cream-50">
                                {doc.name}
                              </span>
                              <span className="text-xs text-ink-500">
                                {doc.uploadedByName}
                              </span>
                              <Download className="h-4 w-4 text-ink-500" />
                            </a>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              )}
              {canUploadDoc && (
                <div className="border-t border-ink-800 pt-3">
                  <FileUpload
                    pathPrefix={`projects/${p.id}/documents`}
                    value={[]}
                    onChange={() => {}}
                    onUploaded={attachDoc}
                  />
                </div>
              )}
            </CardBody>
          </Card>

          {/* Reports / deliverables */}
          <Card>
            <CardHeader>
              <CardTitle>{d.project.deliverables}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {p.reports.length === 0 ? (
                <p className="text-sm text-ink-500">{d.project.noReports}</p>
              ) : (
                <ul className="space-y-2">
                  {p.reports.map((r) => (
                    <li key={r.id}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-lg border border-gold-500/20 bg-gold-500/5 px-3 py-2.5 transition-colors hover:border-gold-500/40"
                      >
                        <FileCheck className="h-4 w-4 shrink-0 text-gold-400" />
                        <span className="min-w-0 flex-1 truncate text-sm text-cream-50">
                          {r.name}
                        </span>
                        <span className="text-xs capitalize text-gold-400">
                          {r.type === "certificate"
                            ? d.project.certificate
                            : r.type === "final"
                              ? d.project.finalReport
                              : d.project.draftReport}
                        </span>
                        <Download className="h-4 w-4 text-gold-500" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {canStaff && <ReportUploader projectId={p.id} />}
            </CardBody>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>{d.project.timeline}</CardTitle>
            </CardHeader>
            <CardBody>
              <ol className="relative space-y-4 ps-5">
                <span className="absolute inset-y-1 start-[5px] w-px bg-ink-700" />
                {[...p.timeline].reverse().map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute -start-5 top-1 h-2.5 w-2.5 rounded-full border-2 border-ink-900 bg-gold-500" />
                    <p className="text-sm text-cream-50">{kindText(e)}</p>
                    <p className="text-xs text-ink-500">
                      {e.byName} · {timeAgo(e.at, locale)}
                    </p>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>

          <RequestMessages projectId={p.id} />
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <RequestActions project={p} />

          <Card>
            <CardHeader>
              <CardTitle>{d.project.client}</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar name={p.clientName} />
                <div>
                  <p className="text-sm font-medium text-cream-50">
                    {p.clientName}
                  </p>
                  {p.clientCompany && (
                    <p className="text-xs text-ink-500">{p.clientCompany}</p>
                  )}
                </div>
              </div>
              <DetailRow
                label={d.project.assignedTo}
                value={
                  p.assignedToName ? (
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-gold-500" />
                      {p.assignedToName}
                    </span>
                  ) : (
                    <span className="text-ink-500">{d.project.unassigned}</span>
                  )
                }
              />
              <DetailRow
                label={d.project.createdAt}
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-ink-500" />
                    {fmtDate(p.createdAt, locale)}
                  </span>
                }
              />
              <DetailRow
                label={d.project.updatedAt}
                value={timeAgo(p.updatedAt, locale)}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
