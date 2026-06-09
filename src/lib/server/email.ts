import "server-only";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "Edarah <onboarding@resend.dev>";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.crmtalal.website";

type Loc = "ar" | "en";

function abs(path?: string): string {
  if (!path) return SITE_URL;
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

/** Send one email via Resend. No-ops (returns false) if not configured. */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  if (!RESEND_API_KEY || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: RESEND_FROM, to, subject, html }),
    });
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error("[Edarah] Resend error", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[Edarah] Resend failed", e);
    return false;
  }
}

/** Branded, bilingual-aware HTML email shell. */
export function emailLayout(opts: {
  locale: Loc;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  preheader?: string;
}): string {
  const rtl = opts.locale === "ar";
  const dir = rtl ? "rtl" : "ltr";
  const align = rtl ? "right" : "left";
  const brand = rtl ? "إدارة للتقييم العقاري" : "Edarah Real Estate Valuation";
  const footer = rtl
    ? "هذه رسالة آلية من منصة إدارة. لا حاجة للرد عليها."
    : "Automated message from the Edarah platform.";
  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px;"><tr><td style="border-radius:999px;background:linear-gradient(180deg,#d1ab5c,#9a7527);">
           <a href="${abs(opts.ctaUrl)}" style="display:inline-block;padding:13px 32px;color:#0a0b0e;font-weight:700;font-size:14px;text-decoration:none;border-radius:999px;">${opts.ctaLabel}</a>
         </td></tr></table>`
      : "";

  return `<!doctype html><html dir="${dir}" lang="${opts.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#0c0d10;font-family:-apple-system,'Segoe UI',Tajawal,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader || opts.title}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0c0d10;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#16181f;border-radius:18px;overflow:hidden;border:1px solid #272c39;">
        <tr><td dir="${dir}" style="background:linear-gradient(135deg,#7f1836,#3d0c1c);padding:26px 32px;text-align:${align};">
          <img src="${SITE_URL}/icons/icon-192.png" width="44" height="44" alt="Edarah" style="border-radius:11px;vertical-align:middle;">
          <span style="color:#f9f4ec;font-size:17px;font-weight:700;vertical-align:middle;padding:0 12px;">${brand}</span>
        </td></tr>
        <tr><td dir="${dir}" style="padding:32px;text-align:${align};">
          <h1 style="margin:0 0 14px;color:#f9f4ec;font-size:21px;font-weight:700;">${opts.title}</h1>
          <p style="margin:0 0 24px;color:#c9b9a0;font-size:15px;line-height:1.9;">${opts.body}</p>
          ${cta}
        </td></tr>
        <tr><td dir="${dir}" style="padding:18px 32px;border-top:1px solid #272c39;text-align:${align};">
          <p style="margin:0;color:#6b7280;font-size:12px;">${footer}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** Send a notification email (used by the notification engine). */
export async function sendEventEmail(
  to: string,
  locale: Loc,
  title: string,
  body: string,
  link?: string,
): Promise<void> {
  const ctaLabel = locale === "ar" ? "عرض في المنصة" : "Open in Edarah";
  await sendEmail(
    to,
    title,
    emailLayout({ locale, title, body, ctaLabel, ctaUrl: link, preheader: body }),
  );
}

/** Welcome email on registration. */
export async function sendWelcomeEmail(
  to: string,
  name: string,
  locale: Loc,
): Promise<void> {
  const title =
    locale === "ar"
      ? `مرحبًا ${name} في إدارة`
      : `Welcome to Edarah, ${name}`;
  const body =
    locale === "ar"
      ? "تم إنشاء حسابك بنجاح. يمكنك الآن طلب تقييم عقاري ومتابعة كل مرحلة لحظيًا، واستلام تقاريرك المعتمدة، وستصلك الإشعارات على المنصة وبريدك الإلكتروني عند كل تحديث."
      : "Your account is ready. You can now request a real-estate valuation, track every stage in real time, receive your accredited reports, and get notified — in-app and by email — at every update.";
  await sendEmail(
    to,
    title,
    emailLayout({
      locale,
      title,
      body,
      ctaLabel: locale === "ar" ? "ابدأ الآن" : "Get started",
      ctaUrl: "/dashboard",
      preheader: body,
    }),
  );
}
