"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Building2,
  Castle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Factory,
  FileText,
  Home,
  Hotel,
  Landmark,
  Layers,
  Map as MapIcon,
  MapPin,
  Send,
  Sparkles,
  Store,
  TrendingUp,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/portal/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Textarea, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { FileUpload, type UploadedFile } from "@/components/portal/FileUpload";
import {
  Stepper,
  SelectCard,
  Chip,
  ReviewRow,
  type WizardStep,
} from "@/components/portal/wizard/WizardBits";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useI18n } from "@/i18n";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import {
  PROPERTY_TYPES,
  PURPOSES,
  PRIORITIES,
  SAUDI_REGIONS,
  type PropertyType,
  type Priority,
} from "@/lib/types";

/* Icon per property type (visual sugar — optional). */
const PROPERTY_ICONS: Record<PropertyType, LucideIcon> = {
  land: MapIcon,
  villa: Home,
  palace: Castle,
  apartment: Building2,
  building: Building2,
  tower: Layers,
  hotel: Hotel,
  compound: Landmark,
  warehouse: Warehouse,
  industrial: Factory,
  mixedUse: Layers,
  project: ClipboardList,
  commercial: Store,
  reit: TrendingUp,
};

const OTHER = "__other__";

type FormState = {
  propertyType: string; // a PROPERTY_TYPES key, OTHER sentinel, or free text
  purpose: string;
  region: string;
  city: string;
  district: string;
  address: string;
  area: string;
  title: string;
  priority: Priority;
  description: string;
};

const initial: FormState = {
  propertyType: "",
  purpose: "",
  region: "",
  city: "",
  district: "",
  address: "",
  area: "",
  title: "",
  priority: "normal",
  description: "",
};

export default function NewRequestPage() {
  const { dict: d, L, isRTL } = useI18n();
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0); // 0..4
  const [dir, setDir] = useState(1); // slide direction
  const [titleTouched, setTitleTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [docs, setDocs] = useState<UploadedFile[]>([]);
  const [form, setForm] = useState<FormState>(initial);
  const [otherType, setOtherType] = useState(""); // free-text when "Other"

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const Prev = isRTL ? ChevronRight : ChevronLeft;
  const Next = isRTL ? ChevronLeft : ChevronRight;

  /* ---- derived labels ---- */
  const isKnownType = PROPERTY_TYPES.includes(form.propertyType as PropertyType);
  const isOther = form.propertyType === OTHER;

  const resolvedType = isOther ? otherType.trim() : form.propertyType;

  const propertyTypeLabel = isKnownType
    ? d.propertyTypes[form.propertyType as PropertyType]
    : resolvedType;

  const purposeLabel = form.purpose ? d.purposes[form.purpose as keyof typeof d.purposes] : "";

  const priorityLabel = (p: Priority) =>
    p === "normal"
      ? d.project.priorityNormal
      : p === "high"
        ? d.project.priorityHigh
        : d.project.priorityUrgent;

  /* ---- suggested title (used as placeholder + auto-prefill) ---- */
  const suggestedTitle = useMemo(() => {
    const t = propertyTypeLabel?.trim();
    const c = form.city.trim();
    if (t && c) return `${t} — ${c}`;
    if (t) return t;
    return "";
  }, [propertyTypeLabel, form.city]);

  /* ---- steps definition ---- */
  const steps: WizardStep[] = [
    { id: 1, label: L({ ar: "العقار", en: "Property" }), icon: Building2 },
    { id: 2, label: d.project.region, icon: MapPin },
    { id: 3, label: d.common.details, icon: FileText },
    { id: 4, label: d.project.documents, icon: ClipboardList },
    { id: 5, label: d.common.summary, icon: CheckCircle2 },
  ];

  /* ---- per-step validation ---- */
  const stepValid = (i: number): boolean => {
    if (i === 0) {
      const typeOk = isOther ? otherType.trim().length > 0 : isKnownType;
      return typeOk && !!form.purpose;
    }
    if (i === 2) return form.title.trim().length > 0 || suggestedTitle.length > 0;
    return true;
  };

  const stepError = (i: number): string | undefined => {
    if (i === 0 && !stepValid(0)) {
      return L({
        ar: "اختر نوع العقار والغرض من التقييم",
        en: "Choose a property type and purpose",
      });
    }
    if (i === 2 && form.title.trim().length === 0 && suggestedTitle.length === 0) {
      return d.common.required;
    }
    return undefined;
  };

  const goNext = () => {
    if (!stepValid(step)) {
      toast.error(stepError(step) ?? d.common.required);
      return;
    }
    // entering the details step: seed the title with the suggestion once.
    if (step === 1 && !titleTouched && !form.title.trim() && suggestedTitle) {
      set("title", suggestedTitle);
    }
    setDir(1);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const goBack = () => {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const jump = (i: number) => {
    if (i === step) return;
    // only allow jumping to a step if every step before it is valid
    for (let k = 0; k < i; k++) {
      if (!stepValid(k)) {
        setStep(k);
        toast.error(stepError(k) ?? d.common.required);
        return;
      }
    }
    setDir(i > step ? 1 : -1);
    setStep(i);
  };

  /* ---- submit ---- */
  const submit = async () => {
    if (!stepValid(0)) {
      setStep(0);
      toast.error(stepError(0) ?? d.common.required);
      return;
    }
    const finalTitle = form.title.trim() || suggestedTitle;
    if (!finalTitle) {
      setStep(2);
      toast.error(d.common.required);
      return;
    }
    if (!resolvedType) {
      setStep(0);
      toast.error(d.common.required);
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<{ id: string }>("/api/projects", {
        body: {
          title: finalTitle,
          propertyType: resolvedType,
          purpose: form.purpose,
          region: form.region || undefined,
          city: form.city || undefined,
          district: form.district || undefined,
          address: form.address || undefined,
          area: form.area ? Number(form.area) : undefined,
          description: form.description || undefined,
          priority: form.priority,
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

  const isLast = step === steps.length - 1;

  /* ---- slide transition ---- */
  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 36 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -36 }),
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        icon={FileText}
        title={d.project.createTitle}
        subtitle={d.project.createSubtitle}
      />

      <Card>
        <CardBody className="p-5 sm:p-7">
          <Stepper steps={steps} current={step} onJump={jump} />

          <div className="relative">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={step}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* ---------- STEP 1 — property type & purpose ---------- */}
                {step === 0 && (
                  <div className="space-y-7">
                    <section>
                      <StepLabel
                        index={1}
                        title={d.project.propertyType}
                        hint={L({
                          ar: "اختر نوع العقار المراد تقييمه",
                          en: "Pick the type of property to be valued",
                        })}
                      />
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                        {PROPERTY_TYPES.map((t) => (
                          <SelectCard
                            key={t}
                            label={d.propertyTypes[t]}
                            icon={PROPERTY_ICONS[t]}
                            selected={form.propertyType === t}
                            onClick={() => set("propertyType", t)}
                          />
                        ))}
                        <SelectCard
                          label={L({ ar: "أخرى", en: "Other" })}
                          icon={Sparkles}
                          selected={isOther}
                          onClick={() => set("propertyType", OTHER)}
                        />
                      </div>

                      <AnimatePresence initial={false}>
                        {isOther && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3.5">
                              <Field
                                label={L({
                                  ar: "حدّد نوع العقار",
                                  en: "Specify the property type",
                                })}
                                required
                              >
                                <Input
                                  autoFocus
                                  value={otherType}
                                  onChange={(e) => setOtherType(e.target.value)}
                                  placeholder={L({
                                    ar: "مثال: محطة وقود، مزرعة، استراحة…",
                                    en: "e.g. Petrol station, Farm, Resort…",
                                  })}
                                />
                              </Field>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </section>

                    <section>
                      <StepLabel
                        index={2}
                        title={d.project.purpose}
                        hint={L({
                          ar: "ما الغرض من التقييم؟",
                          en: "Why do you need this valuation?",
                        })}
                      />
                      <div className="flex flex-wrap gap-2.5">
                        {PURPOSES.map((p) => (
                          <Chip
                            key={p}
                            label={d.purposes[p]}
                            selected={form.purpose === p}
                            onClick={() => set("purpose", p)}
                          />
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {/* ---------- STEP 2 — location ---------- */}
                {step === 1 && (
                  <div className="space-y-5">
                    <StepLabel
                      title={L({ ar: "موقع العقار", en: "Property location" })}
                      hint={L({
                        ar: "كل الحقول اختيارية لكنها تساعدنا على تجهيز الزيارة",
                        en: "All optional, but they help us prepare the visit",
                      })}
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
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
                          min={0}
                          value={form.area}
                          onChange={(e) => set("area", e.target.value)}
                          placeholder="0"
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
                  </div>
                )}

                {/* ---------- STEP 3 — details ---------- */}
                {step === 2 && (
                  <div className="space-y-5">
                    <StepLabel
                      title={d.project.requestDetails}
                      hint={L({
                        ar: "أعطِ طلبك عنوانًا واضحًا وحدّد الأولوية",
                        en: "Give your request a clear title and priority",
                      })}
                    />
                    <Field
                      label={d.project.title}
                      required
                      error={
                        titleTouched && !form.title.trim() && !suggestedTitle
                          ? d.common.required
                          : undefined
                      }
                    >
                      <Input
                        value={form.title}
                        onChange={(e) => {
                          setTitleTouched(true);
                          set("title", e.target.value);
                        }}
                        placeholder={suggestedTitle || d.project.titlePlaceholder}
                      />
                    </Field>

                    <Field label={d.project.priority}>
                      <div className="flex flex-wrap gap-2.5">
                        {PRIORITIES.map((p) => (
                          <Chip
                            key={p}
                            label={priorityLabel(p)}
                            selected={form.priority === p}
                            onClick={() => set("priority", p)}
                          />
                        ))}
                      </div>
                    </Field>

                    <Field label={d.project.description}>
                      <Textarea
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder={d.project.descriptionPlaceholder}
                      />
                    </Field>
                  </div>
                )}

                {/* ---------- STEP 4 — documents ---------- */}
                {step === 3 && (
                  <div className="space-y-5">
                    <StepLabel
                      title={d.project.documents}
                      hint={d.project.documentsHint}
                    />
                    <Field hint={`${d.project.documents} · ${d.common.optional}`}>
                      <FileUpload
                        pathPrefix={`projects/incoming/${user?.uid}`}
                        value={docs}
                        onChange={setDocs}
                      />
                    </Field>
                  </div>
                )}

                {/* ---------- STEP 5 — review & submit ---------- */}
                {step === 4 && (
                  <div className="space-y-5">
                    <StepLabel
                      title={d.common.summary}
                      hint={L({
                        ar: "راجع التفاصيل قبل الإرسال",
                        en: "Review the details before submitting",
                      })}
                    />
                    <div className="rounded-xl border border-ink-700/70 bg-ink-850/50 px-4 py-1.5">
                      <dl>
                        <ReviewRow
                          label={d.project.title}
                          value={form.title.trim() || suggestedTitle}
                        />
                        <ReviewRow
                          label={d.project.propertyType}
                          value={propertyTypeLabel}
                        />
                        <ReviewRow
                          label={d.project.purpose}
                          value={purposeLabel}
                        />
                        <ReviewRow
                          label={d.project.priority}
                          value={priorityLabel(form.priority)}
                        />
                        <ReviewRow
                          label={d.project.region}
                          value={form.region}
                        />
                        <ReviewRow label={d.project.city} value={form.city} />
                        <ReviewRow
                          label={d.project.district}
                          value={form.district}
                        />
                        <ReviewRow
                          label={d.project.address}
                          value={form.address}
                        />
                        <ReviewRow
                          label={`${d.project.area} (${d.project.sqm})`}
                          value={
                            form.area ? (
                              <span className="nums">{form.area}</span>
                            ) : undefined
                          }
                        />
                        <ReviewRow
                          label={d.project.description}
                          value={form.description}
                        />
                        <ReviewRow
                          label={d.project.documents}
                          value={
                            docs.length
                              ? `${docs.length} ${
                                  docs.length === 1
                                    ? L({ ar: "ملف", en: "file" })
                                    : L({ ar: "ملفات", en: "files" })
                                }`
                              : undefined
                          }
                        />
                      </dl>
                    </div>
                    <p className="text-xs text-ink-500">
                      {L({
                        ar: "بإرسال الطلب، سيتواصل معك فريقنا لتأكيد النطاق والرسوم.",
                        en: "By submitting, our team will reach out to confirm scope and fees.",
                      })}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ---------- footer nav ---------- */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink-700/60 pt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={step === 0 ? () => router.back() : goBack}
            >
              {step === 0 ? (
                d.common.cancel
              ) : (
                <>
                  <Prev className="h-4 w-4" />
                  {d.common.back}
                </>
              )}
            </Button>

            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <span
                  key={i}
                  aria-hidden
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === step
                      ? "w-5 bg-gold-500"
                      : i < step
                        ? "w-1.5 bg-gold-500/50"
                        : "w-1.5 bg-ink-700",
                  )}
                />
              ))}
            </div>

            {isLast ? (
              <Button type="button" variant="gold" loading={submitting} onClick={submit}>
                {!submitting && <Send className="h-4 w-4" />}
                {d.project.submitRequest}
              </Button>
            ) : (
              <Button type="button" variant="gold" onClick={goNext}>
                {d.common.next}
                <Next className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* small inline section label */
function StepLabel({
  index,
  title,
  hint,
}: {
  index?: number;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-3.5">
      <div className="flex items-center gap-2">
        {index !== undefined && (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-gold-500/15 text-[0.65rem] font-bold text-gold-300 nums">
            {index}
          </span>
        )}
        <h2 className="text-base font-semibold text-cream-50">{title}</h2>
      </div>
      {hint && <p className="mt-1 text-sm text-ink-500">{hint}</p>}
    </div>
  );
}
