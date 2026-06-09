import type { LocalizedText } from "@/i18n/config";
import type { CompanyType, DealStage } from "@/lib/types";

/** Bilingual labels for CompanyType (not in the shared dictionary). */
export const COMPANY_TYPE_LABEL: Record<CompanyType, LocalizedText> = {
  client: { ar: "عميل", en: "Client" },
  partner: { ar: "شريك", en: "Partner" },
  bank: { ar: "بنك", en: "Bank" },
  developer: { ar: "مطوّر عقاري", en: "Developer" },
  government: { ar: "جهة حكومية", en: "Government" },
  fund: { ar: "صندوق استثماري", en: "Fund" },
  other: { ar: "أخرى", en: "Other" },
};

/** Bilingual labels for DealStage (not in the shared dictionary). */
export const DEAL_STAGE_LABEL: Record<DealStage, LocalizedText> = {
  lead: { ar: "عميل محتمل", en: "Lead" },
  qualified: { ar: "مؤهّل", en: "Qualified" },
  proposal: { ar: "عرض سعر", en: "Proposal" },
  negotiation: { ar: "تفاوض", en: "Negotiation" },
  won: { ar: "مكسوبة", en: "Won" },
  lost: { ar: "خاسرة", en: "Lost" },
};
