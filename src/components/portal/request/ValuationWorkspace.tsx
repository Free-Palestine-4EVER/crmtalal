"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calculator,
  ClipboardCheck,
  Building2,
  Scale,
  CheckCircle2,
  Plus,
  Trash2,
  ListChecks,
  CircleDollarSign,
  Wand2,
  CheckCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Field, Input, Textarea } from "@/components/ui/form";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";
import { apiFetch } from "@/lib/api";
import { fmtMoney, fmtNumber, fmtDateTime } from "@/lib/format";
import { toast } from "sonner";
import {
  INSPECTION_CHECKLIST,
  type Project,
  type InspectionItem,
  type InspectionStatus,
  type ValuationComparable,
  type ValuationData,
} from "@/lib/types";
import type { LocalizedText } from "@/i18n/config";

/* ============================================================
   Local bilingual labels (not in the shared dictionary)
   ============================================================ */
const T = {
  title: { ar: "مساحة عمل التقييم", en: "Valuation workspace" },
  readonlyHint: {
    ar: "ملخص التقييم — للعرض فقط",
    en: "Valuation summary — view only",
  },
  steps: { ar: "خطوات", en: "steps" },

  // tabs
  inspection: { ar: "المعاينة", en: "Inspection" },
  comparables: { ar: "المقارنات", en: "Comparables" },
  approaches: { ar: "الأساليب", en: "Approaches" },
  reconcile: { ar: "التسوية والقيمة النهائية", en: "Reconciliation & final" },

  // inspection
  inspectionIntro: {
    ar: "قيّم حالة كل عنصر من عناصر العقار أثناء المعاينة الميدانية.",
    en: "Rate the condition of each element during the site inspection.",
  },
  notePlaceholder: { ar: "ملاحظة (اختياري)", en: "Note (optional)" },
  inspectionNotes: { ar: "ملاحظات المعاينة العامة", en: "General inspection notes" },
  inspectionNotesPh: {
    ar: "ملاحظات إضافية عن حالة العقار…",
    en: "Additional observations about the property…",
  },
  markInspected: { ar: "تحديد كمُعايَن", en: "Mark as inspected" },
  inspected: { ar: "تمت المعاينة", en: "Inspected" },
  inspectedAt: { ar: "تمت المعاينة في", en: "Inspected on" },

  // statuses
  ok: { ar: "جيد", en: "OK" },
  fair: { ar: "مقبول", en: "Fair" },
  poor: { ar: "ضعيف", en: "Poor" },
  na: { ar: "غير منطبق", en: "N/A" },

  // comparables
  comparablesIntro: {
    ar: "أدخل العقارات المماثلة المباعة لاشتقاق قيمة السوق عبر أسلوب المقارنة.",
    en: "Enter comparable sold properties to derive market value via the comparison approach.",
  },
  addComparable: { ar: "إضافة مقارنة", en: "Add comparable" },
  colAddress: { ar: "العنوان / الوصف", en: "Address / description" },
  colArea: { ar: "المساحة (م²)", en: "Area (m²)" },
  colPrice: { ar: "السعر (ريال)", en: "Price (SAR)" },
  colPpsm: { ar: "السعر / م²", en: "Price / m²" },
  addressPh: { ar: "الموقع أو وصف مختصر", en: "Location or short description" },
  noComparables: {
    ar: "لا توجد مقارنات بعد. أضف أول عقار مماثل.",
    en: "No comparables yet. Add your first comparable.",
  },
  avgPpsm: { ar: "متوسط السعر / م²", en: "Average price / m²" },
  suggestedMarket: { ar: "قيمة السوق المقترحة", en: "Suggested market value" },
  basedOn: {
    ar: "بناءً على متوسط السعر/م² × مساحة العقار",
    en: "Avg price/m² × subject area",
  },
  useAsMarket: { ar: "اعتماد كقيمة سوقية", en: "Use as market value" },
  subjectArea: { ar: "مساحة العقار", en: "Subject area" },
  noArea: {
    ar: "أدخل مساحة العقار لحساب القيمة المقترحة.",
    en: "Set the subject area to compute a suggested value.",
  },

  // approaches
  approachesIntro: {
    ar: "سجّل القيمة المُقدّرة من كل أسلوب من أساليب التقييم الثلاثة.",
    en: "Record the value indicated by each of the three valuation approaches.",
  },
  marketValue: { ar: "قيمة السوق", en: "Market value" },
  costValue: { ar: "القيمة بالتكلفة", en: "Cost value" },
  incomeValue: { ar: "القيمة بالدخل", en: "Income value" },
  marketHelp: {
    ar: "أسلوب المقارنة — مقارنة بالعقارات المماثلة المباعة.",
    en: "Comparison approach — benchmarked against comparable sales.",
  },
  costHelp: {
    ar: "أسلوب التكلفة — تكلفة إعادة البناء مطروحًا منها الإهلاك.",
    en: "Cost approach — replacement cost minus depreciation.",
  },
  incomeHelp: {
    ar: "أسلوب الدخل — القيمة الحالية للإيراد الإيجاري المتوقع.",
    en: "Income approach — present value of expected rental income.",
  },
  prefillFromComps: { ar: "تعبئة من المقارنات", en: "Prefill from comparables" },

  // reconciliation
  reconcileIntro: {
    ar: "اختر القيمة الأنسب من الأساليب، وفسّر سبب اعتمادها، ثم اعتمد القيمة النهائية.",
    en: "Select the most appropriate indicated value, justify it, then set the final value.",
  },
  selectApproach: {
    ar: "اختر أسلوبًا لاعتماد قيمته كقيمة نهائية:",
    en: "Pick an approach to adopt its value as the final value:",
  },
  reconciliation: { ar: "مبررات التسوية", en: "Reconciliation rationale" },
  reconciliationPh: {
    ar: "لماذا تمثل هذه القيمة أفضل تقدير للقيمة السوقية…",
    en: "Why this value best represents the market value…",
  },
  finalValueLabel: { ar: "القيمة النهائية", en: "Final value" },
  setFinal: { ar: "اعتماد القيمة النهائية", en: "Set final value" },
  finalValueSet: { ar: "القيمة النهائية المعتمدة", en: "Final value" },
  noFinal: { ar: "لم تُعتمد قيمة نهائية بعد", en: "No final value set yet" },
  selected: { ar: "معتمد", en: "Selected" },

  // read-only summary
  approachValues: { ar: "قيم الأساليب", en: "Approach values" },
  inspectionDone: { ar: "اكتمال المعاينة", en: "Inspection" },
  comparablesCount: { ar: "عدد المقارنات", en: "Comparables" },

  notSet: { ar: "—", en: "—" },
} as const;

/* status meta */
const STATUS_META: {
  value: InspectionStatus;
  label: LocalizedText;
  tone: "positive" | "caution" | "critical" | "neutral";
}[] = [
  { value: "ok", label: T.ok, tone: "positive" },
  { value: "fair", label: T.fair, tone: "caution" },
  { value: "poor", label: T.poor, tone: "critical" },
  { value: "na", label: T.na, tone: "neutral" },
];

const STATUS_ACTIVE: Record<InspectionStatus, string> = {
  ok: "border-positive/60 bg-positive/15 text-positive",
  fair: "border-caution/60 bg-caution/15 text-caution",
  poor: "border-critical/60 bg-critical/15 text-critical",
  na: "border-ink-500/70 bg-ink-700/60 text-parch-100/80",
};

type TabKey = "inspection" | "comparables" | "approaches" | "reconcile";

const panelMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

/* helpers */
function toNum(v: string): number | undefined {
  if (v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function numStr(n: number | undefined): string {
  return n === undefined || n === null ? "" : String(n);
}

/* seed a full inspection list (every checklist item present) from saved data */
function seedInspection(saved?: InspectionItem[]): InspectionItem[] {
  const byKey = new Map((saved ?? []).map((i) => [i.key, i]));
  return INSPECTION_CHECKLIST.map(
    (c) => byKey.get(c.key) ?? { key: c.key, status: "na" as InspectionStatus },
  );
}

/* ============================================================
   Component
   ============================================================ */
export function ValuationWorkspace({
  project,
  canEdit,
}: {
  project: Project;
  canEdit: boolean;
}) {
  const v = project.valuation;

  if (!canEdit) {
    return <ReadOnlySummary project={project} />;
  }

  // Re-seed local editable state whenever a fresh realtime snapshot arrives.
  return <Editor project={project} key={v?.updatedAt ?? 0} />;
}

/* ------------------------------------------------------------
   Read-only summary (clients / non-assigned staff)
   ------------------------------------------------------------ */
function ReadOnlySummary({ project }: { project: Project }) {
  const { L, locale } = useI18n();
  const v = project.valuation;
  const inspected = (v?.inspection ?? []).filter(
    (i) => i.status !== "na",
  ).length;
  const total = INSPECTION_CHECKLIST.length;
  const compCount = v?.comparables?.length ?? 0;
  const finalValue = v?.finalValue ?? project.estimatedValue;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-500/12 text-gold-300 ring-1 ring-gold-500/20">
            <Calculator className="h-4 w-4" />
          </span>
          <CardTitle>{L(T.title)}</CardTitle>
        </div>
        <span className="text-xs text-ink-500">{L(T.readonlyHint)}</span>
      </CardHeader>
      <CardBody className="space-y-5">
        {/* Final value hero */}
        <div className="glow-gold relative overflow-hidden rounded-2xl border border-gold-500/25 bg-gradient-to-br from-maroon-900/30 to-ink-850/60 p-5">
          <p className="text-xs uppercase tracking-wide text-gold-300/80">
            {L(T.finalValueSet)}
          </p>
          <p className="nums mt-1 text-3xl font-bold text-gold-300">
            {finalValue ? fmtMoney(finalValue, locale) : L(T.noFinal)}
          </p>
        </div>

        {/* Approach grid */}
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label={L(T.marketValue)} value={v?.marketValue} locale={locale} />
          <MiniStat label={L(T.costValue)} value={v?.costValue} locale={locale} />
          <MiniStat label={L(T.incomeValue)} value={v?.incomeValue} locale={locale} />
        </div>

        {/* meta row */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge tone={inspected === total ? "positive" : inspected > 0 ? "caution" : "neutral"}>
            <ListChecks className="h-3.5 w-3.5" />
            {L(T.inspectionDone)}: {inspected}/{total}
          </Badge>
          <Badge tone={compCount > 0 ? "gold" : "neutral"}>
            <Building2 className="h-3.5 w-3.5" />
            {L(T.comparablesCount)}: {fmtNumber(compCount, locale)}
          </Badge>
          {v?.inspectedAt ? (
            <Badge tone="info">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {L(T.inspectedAt)} {fmtDateTime(v.inspectedAt, locale)}
            </Badge>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}

function MiniStat({
  label,
  value,
  locale,
}: {
  label: string;
  value?: number;
  locale: "ar" | "en";
}) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-850/60 p-3">
      <p className="truncate text-[0.7rem] text-ink-500">{label}</p>
      <p className="nums mt-0.5 text-sm font-semibold text-parch-50">
        {value ? fmtMoney(value, locale) : "—"}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------
   Full editor
   ------------------------------------------------------------ */
function Editor({ project }: { project: Project }) {
  const { L, locale } = useI18n();
  const v = project.valuation;
  const [tab, setTab] = useState<TabKey>("inspection");

  /* ---- editable state, seeded from project.valuation ---- */
  const [inspection, setInspection] = useState<InspectionItem[]>(() =>
    seedInspection(v?.inspection),
  );
  const [inspectionNotes, setInspectionNotes] = useState(
    v?.inspectionNotes ?? "",
  );
  const [inspectedAt, setInspectedAt] = useState<number | undefined>(
    v?.inspectedAt,
  );

  const [comparables, setComparables] = useState<ValuationComparable[]>(
    () => v?.comparables ?? [],
  );

  const [marketValue, setMarketValue] = useState<string>(numStr(v?.marketValue));
  const [costValue, setCostValue] = useState<string>(numStr(v?.costValue));
  const [incomeValue, setIncomeValue] = useState<string>(numStr(v?.incomeValue));

  const [finalValue, setFinalValue] = useState<string>(numStr(v?.finalValue));
  const [reconciliation, setReconciliation] = useState(v?.reconciliation ?? "");

  const [busy, setBusy] = useState<string | null>(null);

  /* ---- derived ---- */
  const inspectedCount = inspection.filter((i) => i.status !== "na").length;
  const avgPpsm = useMemo(() => {
    const vals = comparables
      .map((c) =>
        c.price && c.area && c.area > 0 ? c.price / c.area : undefined,
      )
      .filter((n): n is number => n !== undefined);
    if (vals.length === 0) return undefined;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [comparables]);

  const suggestedMarket = useMemo(() => {
    if (avgPpsm === undefined || !project.area) return undefined;
    return Math.round(avgPpsm * project.area);
  }, [avgPpsm, project.area]);

  /* progress: 4 steps */
  const stepsDone =
    (inspectedAt ? 1 : 0) +
    (comparables.length > 0 ? 1 : 0) +
    (toNum(marketValue) || toNum(costValue) || toNum(incomeValue) ? 1 : 0) +
    (toNum(finalValue) ? 1 : 0);

  /* ---- persistence ---- */
  async function save(key: string, patch: Partial<ValuationData>) {
    setBusy(key);
    try {
      await apiFetch(`/api/projects/${project.id}`, {
        body: { action: "valuation", valuation: patch },
      });
      toast.success(locale === "ar" ? "تم الحفظ" : "Saved");
    } catch (e) {
      toast.error((e as Error)?.message || (locale === "ar" ? "حدث خطأ" : "Error"));
    } finally {
      setBusy(null);
    }
  }

  /* ---- inspection mutations ---- */
  const setItemStatus = (key: string, status: InspectionStatus) =>
    setInspection((prev) =>
      prev.map((i) => (i.key === key ? { ...i, status } : i)),
    );
  const setItemNote = (key: string, note: string) =>
    setInspection((prev) =>
      prev.map((i) => (i.key === key ? { ...i, note } : i)),
    );

  const saveInspection = (markInspected?: boolean) => {
    const ts = markInspected ? Date.now() : inspectedAt;
    if (markInspected) setInspectedAt(ts);
    // strip empty notes for a clean payload
    const clean = inspection.map((i) =>
      i.note && i.note.trim() ? i : { key: i.key, status: i.status },
    );
    return save("inspection", {
      inspection: clean,
      inspectionNotes,
      inspectedAt: ts,
    });
  };

  /* ---- comparable mutations ---- */
  const addComparable = () =>
    setComparables((prev) => [
      ...prev,
      { id: crypto.randomUUID(), address: "", area: undefined, price: undefined },
    ]);
  const updateComparable = (
    id: string,
    patch: Partial<ValuationComparable>,
  ) =>
    setComparables((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  const removeComparable = (id: string) =>
    setComparables((prev) => prev.filter((c) => c.id !== id));

  const saveComparables = (alsoMarket?: number) => {
    if (alsoMarket !== undefined) setMarketValue(String(alsoMarket));
    return save("comparables", {
      comparables,
      ...(alsoMarket !== undefined ? { marketValue: alsoMarket } : {}),
    });
  };

  const saveApproaches = () =>
    save("approaches", {
      marketValue: toNum(marketValue),
      costValue: toNum(costValue),
      incomeValue: toNum(incomeValue),
    });

  const saveFinal = () =>
    save("final", {
      finalValue: toNum(finalValue),
      reconciliation,
    });

  /* approach cards for reconciliation */
  const approachCards: {
    key: "market" | "cost" | "income";
    label: LocalizedText;
    value?: number;
  }[] = [
    { key: "market", label: T.marketValue, value: toNum(marketValue) },
    { key: "cost", label: T.costValue, value: toNum(costValue) },
    { key: "income", label: T.incomeValue, value: toNum(incomeValue) },
  ];

  const tabs = [
    { key: "inspection" as const, label: L(T.inspection), icon: ClipboardCheck },
    { key: "comparables" as const, label: L(T.comparables), icon: Building2 },
    { key: "approaches" as const, label: L(T.approaches), icon: Scale },
    { key: "reconcile" as const, label: L(T.reconcile), icon: CheckCircle2 },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-500/12 text-gold-300 ring-1 ring-gold-500/20">
            <Calculator className="h-4 w-4" />
          </span>
          <CardTitle>{L(T.title)}</CardTitle>
        </div>
        <Badge tone={stepsDone === 4 ? "positive" : "gold"}>
          {fmtNumber(stepsDone, locale)}/4 {L(T.steps)}
        </Badge>
      </CardHeader>

      <CardBody className="space-y-5">
        <div className="-mx-1 overflow-x-auto pb-1">
          <Tabs tabs={tabs} value={tab} onChange={setTab} className="min-w-max" />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {/* ============ INSPECTION ============ */}
          {tab === "inspection" && (
            <motion.div key="inspection" {...panelMotion} className="space-y-4">
              <SectionIntro icon={ListChecks} text={L(T.inspectionIntro)} />

              <div className="space-y-2.5">
                {inspection.map((item) => {
                  const meta = INSPECTION_CHECKLIST.find((c) => c.key === item.key);
                  return (
                    <div
                      key={item.key}
                      className="rounded-xl border border-ink-700 bg-ink-850/50 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm font-medium text-parch-50">
                          {meta ? L({ ar: meta.ar, en: meta.en }) : item.key}
                        </span>
                        <div className="inline-flex items-center gap-1 rounded-full border border-ink-700 bg-ink-900/60 p-1">
                          {STATUS_META.map((s) => {
                            const active = item.status === s.value;
                            return (
                              <button
                                key={s.value}
                                type="button"
                                onClick={() => setItemStatus(item.key, s.value)}
                                aria-pressed={active}
                                className={cn(
                                  "rounded-full border border-transparent px-3 py-1 text-xs font-medium transition-colors",
                                  active
                                    ? STATUS_ACTIVE[s.value]
                                    : "text-parch-100/55 hover:text-parch-50",
                                )}
                              >
                                {L(s.label)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <Input
                        value={item.note ?? ""}
                        onChange={(e) => setItemNote(item.key, e.target.value)}
                        placeholder={L(T.notePlaceholder)}
                        className="mt-2.5 h-10 text-sm"
                      />
                    </div>
                  );
                })}
              </div>

              <Field label={L(T.inspectionNotes)}>
                <Textarea
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder={L(T.inspectionNotesPh)}
                  className="min-h-24"
                />
              </Field>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-700/70 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  {inspectedAt ? (
                    <Badge tone="positive">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {L(T.inspected)} · {fmtDateTime(inspectedAt, locale)}
                    </Badge>
                  ) : (
                    <span className="nums text-ink-500">
                      {inspectedCount}/{INSPECTION_CHECKLIST.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => saveInspection(true)}
                    loading={busy === "inspection"}
                  >
                    <CheckCheck className="h-4 w-4" />
                    {L(T.markInspected)}
                  </Button>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => saveInspection(false)}
                    loading={busy === "inspection"}
                  >
                    {locale === "ar" ? "حفظ" : "Save"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============ COMPARABLES ============ */}
          {tab === "comparables" && (
            <motion.div key="comparables" {...panelMotion} className="space-y-4">
              <SectionIntro icon={Building2} text={L(T.comparablesIntro)} />

              {/* header row (desktop) */}
              {comparables.length > 0 && (
                <div className="hidden grid-cols-[1fr_7rem_8rem_7rem_2.5rem] gap-2 px-1 text-[0.7rem] font-medium uppercase tracking-wide text-ink-500 md:grid">
                  <span>{L(T.colAddress)}</span>
                  <span className="text-end">{L(T.colArea)}</span>
                  <span className="text-end">{L(T.colPrice)}</span>
                  <span className="text-end">{L(T.colPpsm)}</span>
                  <span />
                </div>
              )}

              <div className="space-y-2.5">
                {comparables.length === 0 && (
                  <div className="rounded-xl border border-dashed border-ink-700 bg-ink-850/40 px-4 py-8 text-center text-sm text-ink-500">
                    {L(T.noComparables)}
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {comparables.map((c) => {
                    const ppsm =
                      c.price && c.area && c.area > 0
                        ? c.price / c.area
                        : undefined;
                    return (
                      <motion.div
                        key={c.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 gap-2 rounded-xl border border-ink-700 bg-ink-850/50 p-2.5 md:grid-cols-[1fr_7rem_8rem_7rem_2.5rem] md:items-center md:bg-transparent md:p-1">
                          <Input
                            value={c.address ?? ""}
                            onChange={(e) =>
                              updateComparable(c.id, { address: e.target.value })
                            }
                            placeholder={L(T.addressPh)}
                            className="h-10 text-sm"
                          />
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={numStr(c.area)}
                            onChange={(e) =>
                              updateComparable(c.id, { area: toNum(e.target.value) })
                            }
                            placeholder={locale === "ar" ? "م²" : "m²"}
                            className="nums h-10 text-sm md:text-end"
                          />
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={numStr(c.price)}
                            onChange={(e) =>
                              updateComparable(c.id, { price: toNum(e.target.value) })
                            }
                            placeholder={locale === "ar" ? "ريال" : "SAR"}
                            className="nums h-10 text-sm md:text-end"
                          />
                          <div className="nums flex h-10 items-center justify-end rounded-lg px-1 text-sm font-medium text-gold-300">
                            {ppsm !== undefined ? fmtMoney(Math.round(ppsm), locale) : "—"}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeComparable(c.id)}
                            aria-label={locale === "ar" ? "حذف" : "Remove"}
                            className="grid h-10 w-10 place-items-center justify-self-end rounded-lg text-ink-500 transition-colors hover:bg-critical/10 hover:text-critical"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <Button variant="outline" size="sm" onClick={addComparable}>
                <Plus className="h-4 w-4" />
                {L(T.addComparable)}
              </Button>

              {/* aggregates */}
              <div className="grid gap-3 rounded-2xl border border-ink-700 bg-ink-850/50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-ink-500">{L(T.avgPpsm)}</p>
                  <p className="nums mt-0.5 text-lg font-semibold text-parch-50">
                    {avgPpsm !== undefined ? fmtMoney(Math.round(avgPpsm), locale) : "—"}
                  </p>
                </div>
                <div className="sm:border-s sm:border-ink-700 sm:ps-4">
                  <p className="text-xs text-ink-500">
                    {L(T.suggestedMarket)}
                    {project.area ? (
                      <span className="ms-1 text-ink-600">
                        ({L(T.subjectArea)} {fmtNumber(project.area, locale)} m²)
                      </span>
                    ) : null}
                  </p>
                  {project.area ? (
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <p className="nums text-lg font-semibold text-gold-300">
                        {suggestedMarket !== undefined
                          ? fmtMoney(suggestedMarket, locale)
                          : "—"}
                      </p>
                      {suggestedMarket !== undefined && (
                        <Button
                          variant="subtle"
                          size="sm"
                          className="h-8 px-3"
                          onClick={() => saveComparables(suggestedMarket)}
                          loading={busy === "comparables"}
                        >
                          <Wand2 className="h-3.5 w-3.5" />
                          {L(T.useAsMarket)}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="mt-0.5 text-xs text-ink-500">{L(T.noArea)}</p>
                  )}
                  {!project.area ? null : (
                    <p className="mt-1 text-[0.7rem] text-ink-600">{L(T.basedOn)}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-ink-700/70 pt-4">
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => saveComparables()}
                  loading={busy === "comparables"}
                >
                  {locale === "ar" ? "حفظ المقارنات" : "Save comparables"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ============ APPROACHES ============ */}
          {tab === "approaches" && (
            <motion.div key="approaches" {...panelMotion} className="space-y-4">
              <SectionIntro icon={Scale} text={L(T.approachesIntro)} />

              <div className="space-y-4">
                <ApproachField
                  label={L(T.marketValue)}
                  help={L(T.marketHelp)}
                  value={marketValue}
                  onChange={setMarketValue}
                  accent
                  extra={
                    suggestedMarket !== undefined ? (
                      <button
                        type="button"
                        onClick={() => setMarketValue(String(suggestedMarket))}
                        className="inline-flex items-center gap-1 text-xs text-gold-300 hover:text-gold-200"
                      >
                        <Wand2 className="h-3.5 w-3.5" />
                        {L(T.prefillFromComps)} · {fmtMoney(suggestedMarket, locale)}
                      </button>
                    ) : null
                  }
                />
                <ApproachField
                  label={L(T.costValue)}
                  help={L(T.costHelp)}
                  value={costValue}
                  onChange={setCostValue}
                />
                <ApproachField
                  label={L(T.incomeValue)}
                  help={L(T.incomeHelp)}
                  value={incomeValue}
                  onChange={setIncomeValue}
                />
              </div>

              <div className="flex justify-end border-t border-ink-700/70 pt-4">
                <Button
                  variant="gold"
                  size="sm"
                  onClick={saveApproaches}
                  loading={busy === "approaches"}
                >
                  {locale === "ar" ? "حفظ الأساليب" : "Save approaches"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ============ RECONCILIATION ============ */}
          {tab === "reconcile" && (
            <motion.div key="reconcile" {...panelMotion} className="space-y-4">
              <SectionIntro icon={CheckCircle2} text={L(T.reconcileIntro)} />

              <p className="text-sm text-parch-100/70">{L(T.selectApproach)}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {approachCards.map((a) => {
                  const has = a.value !== undefined;
                  const selected =
                    has && toNum(finalValue) === a.value;
                  return (
                    <button
                      key={a.key}
                      type="button"
                      disabled={!has}
                      onClick={() => setFinalValue(String(a.value))}
                      className={cn(
                        "relative rounded-xl border p-4 text-start transition-all",
                        !has && "cursor-not-allowed opacity-40",
                        selected
                          ? "border-gold-500/70 bg-gold-500/10 glow-gold"
                          : "border-ink-700 bg-ink-850/50 hover:border-gold-500/40",
                      )}
                    >
                      <p className="text-xs text-ink-500">{L(a.label)}</p>
                      <p className="nums mt-1 text-lg font-semibold text-parch-50">
                        {has ? fmtMoney(a.value!, locale) : "—"}
                      </p>
                      {selected && (
                        <span className="absolute end-2.5 top-2.5 inline-flex items-center gap-1 text-[0.7rem] font-medium text-gold-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {L(T.selected)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <Field label={L(T.reconciliation)}>
                <Textarea
                  value={reconciliation}
                  onChange={(e) => setReconciliation(e.target.value)}
                  placeholder={L(T.reconciliationPh)}
                  className="min-h-28"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <Field label={`${L(T.finalValueLabel)} (${project.currency})`}>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={finalValue}
                    onChange={(e) => setFinalValue(e.target.value)}
                    placeholder="0"
                    className="nums"
                  />
                </Field>
                <Button
                  variant="gold"
                  onClick={saveFinal}
                  loading={busy === "final"}
                  className="w-full sm:w-auto"
                >
                  <CircleDollarSign className="h-4.5 w-4.5" />
                  {L(T.setFinal)}
                </Button>
              </div>

              {/* final value hero */}
              <div className="glow-gold relative overflow-hidden rounded-2xl border border-gold-500/25 bg-gradient-to-br from-maroon-900/30 to-ink-850/60 p-5 text-center">
                <p className="text-xs uppercase tracking-wide text-gold-300/80">
                  {L(T.finalValueSet)}
                </p>
                <p className="nums mt-1 text-3xl font-bold text-gold-300 sm:text-4xl">
                  {toNum(finalValue) !== undefined
                    ? fmtMoney(toNum(finalValue)!, locale)
                    : L(T.noFinal)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------
   Small building blocks
   ------------------------------------------------------------ */
function SectionIntro({
  icon: Icon,
  text,
}: {
  icon: typeof ListChecks;
  text: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-ink-700/70 bg-ink-850/40 px-3.5 py-3 text-sm text-parch-100/70">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-300/80" />
      <p>{text}</p>
    </div>
  );
}

function ApproachField({
  label,
  help,
  value,
  onChange,
  accent,
  extra,
}: {
  label: string;
  help: string;
  value: string;
  onChange: (v: string) => void;
  accent?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        accent ? "border-gold-500/30 bg-gold-500/5" : "border-ink-700 bg-ink-850/50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-parch-50">{label}</p>
          <p className="mt-0.5 text-xs text-ink-500">{help}</p>
        </div>
        {extra}
      </div>
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="nums mt-3"
      />
    </div>
  );
}
