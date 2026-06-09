"use client";

import Link from "next/link";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "sonner";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form";
import { auth, firebaseEnabled } from "@/lib/firebase/client";
import { authErrorMessage } from "@/lib/auth/firebaseErrors";
import { useDict } from "@/i18n";

export default function ForgotPasswordPage() {
  const d = useDict();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseEnabled || loading) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      // Never reveal whether an account exists. Only surface configuration /
      // rate-limit style failures; otherwise fall through to the success state.
      const code = (err as { code?: string })?.code ?? "";
      if (code === "auth/too-many-requests") {
        toast.error(authErrorMessage(code, d));
        setLoading(false);
        return;
      }
    }
    setSent(true);
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-semibold text-gradient-light">
          {d.auth.resetPassword}
        </h1>
        <p className="mt-1.5 text-sm text-parch-100/60">
          {d.auth.resetSubtitle}
        </p>
      </div>

      {!firebaseEnabled && (
        <div className="mb-6 rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm text-gold-200">
          {d.meta.name} portal isn&rsquo;t configured yet. Please check back
          soon.
        </div>
      )}

      {sent ? (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/10 text-gold-300">
            <MailCheck className="h-6 w-6" />
          </span>
          <p className="text-sm leading-relaxed text-parch-100/80">
            {d.auth.resetSent}
          </p>
          <Button href="/login" variant="outline" size="md" className="mt-2">
            {d.auth.signIn}
          </Button>
        </div>
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            <Field label={d.auth.email} htmlFor="email" required>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!firebaseEnabled || loading}
                required
                placeholder="you@example.com"
              />
            </Field>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              loading={loading}
              disabled={!firebaseEnabled || loading}
              className="mt-1 w-full"
            >
              {d.auth.sendResetLink}
            </Button>
          </form>

          <Link
            href="/login"
            className="group mt-6 inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-parch-100/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 text-gold-500 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5" />
            {d.auth.signIn}
          </Link>
        </>
      )}
    </div>
  );
}
