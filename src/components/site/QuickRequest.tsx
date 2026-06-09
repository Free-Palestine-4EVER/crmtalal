"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { describeAuthError } from "@/lib/auth/firebaseErrors";
import { apiFetch } from "@/lib/api";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";

const SUGGESTIONS: { ar: string; en: string }[] = [
  { ar: "فيلا", en: "Villa" },
  { ar: "شقة", en: "Apartment" },
  { ar: "أرض", en: "Land" },
  { ar: "عمارة", en: "Building" },
  { ar: "برج تجاري", en: "Commercial tower" },
  { ar: "مستودع", en: "Warehouse" },
];

const inputClass =
  "w-full rounded-xl border border-[#e7ddca] bg-[#faf7f0] px-4 h-12 text-ink-900 placeholder:text-ink-500 outline-none transition-colors focus:border-gold-600 focus:bg-white focus:ring-2 focus:ring-gold-600/20";

export function QuickRequest() {
  const { dict: d, locale, L } = useI18n();
  const ar = locale === "ar";
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<"form" | "account">("form");
  const [busy, setBusy] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", propertyType: "" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  /** Create the tracked valuation request, then go to it. */
  const createRequest = async () => {
    await apiFetch("/api/auth/register", {
      body: { name: form.name, phone: form.phone, locale },
    });
    const res = await apiFetch<{ id: string }>("/api/projects", {
      body: {
        title: form.propertyType || (ar ? "طلب تقييم عقاري" : "Valuation request"),
        propertyType: form.propertyType || "other",
        purpose: "financing",
        leadId: leadId ?? undefined,
      },
    });
    toast.success(d.project.requestSubmitted);
    router.push(`/requests/${res.id}`);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error(d.common.required);
      return;
    }
    setBusy(true);
    try {
      const res = await apiFetch<{ id: string }>("/api/leads", {
        body: {
          name: form.name,
          phone: form.phone,
          propertyType: form.propertyType,
        },
      });
      setLeadId(res.id);
      if (user) {
        await createRequest();
        return;
      }
      setStep("account");
    } catch {
      toast.error(d.common.error);
    } finally {
      setBusy(false);
    }
  };

  const withGoogle = async () => {
    setBusy(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      await createRequest();
    } catch (err) {
      toast.error(describeAuthError(err, d));
      setBusy(false);
    }
  };

  const withEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error(d.auth.weakPassword);
      return;
    }
    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: form.name });
      await createRequest();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      // Existing account → sign them in with the same credentials and proceed.
      if (code === "auth/email-already-in-use") {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          await createRequest();
          return;
        } catch (signInErr) {
          toast.error(describeAuthError(signInErr, d));
          setBusy(false);
          return;
        }
      }
      toast.error(describeAuthError(err, d));
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#ece3d2] bg-white p-6 shadow-[0_30px_70px_-30px_rgba(114,20,47,0.35)] sm:p-7">
      <AnimatePresence mode="wait">
        {step === "form" ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={submitForm}
            className="space-y-4"
          >
            <div>
              <h3 className="font-display text-xl font-semibold text-ink-900">
                {ar ? "اطلب تقييمك العقاري" : "Request your valuation"}
              </h3>
              <p className="mt-1 text-sm text-ink-500">
                {ar
                  ? "أدخل بياناتك وسنتواصل معك — أو تابع طلبك مباشرة."
                  : "Tell us about it — we'll handle the rest."}
              </p>
            </div>

            <input
              className={inputClass}
              placeholder={d.contact.formName}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              autoComplete="name"
            />
            <input
              className={inputClass}
              placeholder={d.contact.formPhone}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
            />
            <div>
              <input
                className={inputClass}
                placeholder={
                  ar
                    ? "نوع العقار (اكتبه بنفسك)"
                    : "Property type (type it yourself)"
                }
                value={form.propertyType}
                onChange={(e) => set("propertyType", e.target.value)}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => {
                  const label = L(s);
                  const active = form.propertyType === label;
                  return (
                    <button
                      key={s.en}
                      type="button"
                      onClick={() => set("propertyType", label)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        active
                          ? "border-maroon-600 bg-maroon-600 text-white"
                          : "border-[#e7ddca] text-ink-700 hover:border-gold-600",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-maroon-600 font-semibold text-cream-50 transition-colors hover:bg-maroon-700 disabled:opacity-60"
            >
              {busy
                ? d.common.submitting
                : ar
                  ? "إرسال الطلب"
                  : "Send request"}
              {!busy && <ArrowRight className="h-4 w-4 rtl:rotate-180" />}
            </button>
            <p className="text-center text-[0.7rem] text-ink-500">
              {ar
                ? "بالإرسال توافق على الشروط وسياسة الخصوصية."
                : "By sending you agree to our terms & privacy policy."}
            </p>
          </motion.form>
        ) : (
          <motion.div
            key="account"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-3 rounded-xl border border-positive/30 bg-positive/10 p-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-positive" />
              <p className="text-sm text-ink-700">
                {ar
                  ? "تم استلام طلبك! أنشئ حسابك في خطوة واحدة لمتابعة كل مرحلة واستلام تقريرك."
                  : "Request received! Create your account in one step to track every stage and get your report."}
              </p>
            </div>

            <button
              type="button"
              onClick={withGoogle}
              disabled={busy}
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-[#e2d8c4] bg-white font-medium text-ink-900 transition-colors hover:bg-[#faf7f0] disabled:opacity-60"
            >
              <GoogleGlyph />
              {d.auth.googleSignIn}
            </button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-[#ece3d2]" />
              <span className="text-xs uppercase tracking-wider text-ink-500">
                {d.auth.orContinue}
              </span>
              <span className="h-px flex-1 bg-[#ece3d2]" />
            </div>

            <form onSubmit={withEmail} className="space-y-3">
              <input
                className={inputClass}
                type="email"
                placeholder={d.auth.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                required
              />
              <input
                className={inputClass}
                type="password"
                placeholder={`${d.auth.password} (${ar ? "8 أحرف على الأقل" : "8+ chars"})`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                required
              />
              <button
                type="submit"
                disabled={busy}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-500 to-gold-600 font-semibold text-ink-950 transition-colors hover:from-gold-400 hover:to-gold-500 disabled:opacity-60"
              >
                {busy ? d.auth.creatingAccount : d.auth.createAccount}
              </button>
            </form>

            <p className="flex items-center justify-center gap-1.5 text-center text-[0.7rem] text-ink-500">
              <ShieldCheck className="h-3.5 w-3.5 text-gold-700" />
              {ar
                ? "بياناتك محمية وسرّية تمامًا."
                : "Your information is private & secure."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.27a12 12 0 0 0 0 10.76l4-3.09Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.96 11.96 0 0 0 12 0 12 12 0 0 0 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  );
}
