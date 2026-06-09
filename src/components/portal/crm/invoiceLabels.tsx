import type { LocalizedText } from "@/i18n/config";
import type { InvoiceStatus } from "@/lib/types";

/* ============================================================
   Bilingual labels for invoice enums + fields that aren't in
   the shared dictionary. Render with L(map[value]).
   ============================================================ */

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, LocalizedText> = {
  draft: { ar: "مسودة", en: "Draft" },
  sent: { ar: "مُرسلة", en: "Sent" },
  paid: { ar: "مدفوعة", en: "Paid" },
  overdue: { ar: "متأخرة", en: "Overdue" },
  cancelled: { ar: "ملغاة", en: "Cancelled" },
};

/** Field + action labels for the invoice form and drawer. */
export const INVOICE_LABEL = {
  number: { ar: "رقم الفاتورة", en: "Invoice no." },
  clientName: { ar: "اسم العميل", en: "Client name" },
  projectCode: { ar: "رمز المشروع", en: "Project code" },
  status: { ar: "الحالة", en: "Status" },
  issuedAt: { ar: "تاريخ الإصدار", en: "Issue date" },
  dueAt: { ar: "تاريخ الاستحقاق", en: "Due date" },
  paidAt: { ar: "تاريخ الدفع", en: "Paid on" },
  notes: { ar: "ملاحظات", en: "Notes" },
  items: { ar: "البنود", en: "Line items" },
  description: { ar: "الوصف", en: "Description" },
  qty: { ar: "الكمية", en: "Qty" },
  unitPrice: { ar: "سعر الوحدة", en: "Unit price" },
  amount: { ar: "المبلغ", en: "Amount" },
  vatRate: { ar: "نسبة الضريبة %", en: "VAT rate %" },
  addItem: { ar: "إضافة بند", en: "Add item" },
  noItems: { ar: "لا توجد بنود بعد", en: "No items yet" },
  markSent: { ar: "تعليم كمُرسلة", en: "Mark as sent" },
  print: { ar: "طباعة", en: "Print" },
  outstanding: { ar: "المستحقات", en: "Outstanding" },
  paidTotal: { ar: "المدفوع", en: "Paid" },
  drafts: { ar: "المسودات", en: "Drafts" },
  invoiceFor: { ar: "فاتورة إلى", en: "Invoice for" },
  detailsTitle: { ar: "تفاصيل الفاتورة", en: "Invoice details" },
  deleteInvoice: { ar: "حذف الفاتورة", en: "Delete invoice" },
  deleteConfirm: {
    ar: "سيتم حذف هذه الفاتورة نهائيًا. لا يمكن التراجع عن هذا الإجراء.",
    en: "This invoice will be permanently deleted. This action cannot be undone.",
  },
} satisfies Record<string, LocalizedText>;
