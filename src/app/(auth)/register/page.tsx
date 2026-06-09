"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form";
import { auth, firebaseEnabled } from "@/lib/firebase/client";
import { authErrorMessage } from "@/lib/auth/firebaseErrors";
import { apiFetch } from "@/lib/api";
import { useDict, useI18n } from "@/i18n";

export default function RegisterPage() {
  const d = useDict();
  const { locale } = useI18n();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseEnabled || loading) return;

    if (password.length < 8) {
      toast.error(d.auth.weakPassword);
      return;
    }
    if (password !== confirmPassword) {
      toast.error(d.auth.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await apiFetch("/api/auth/register", {
        body: { name, phone, company, locale },
      });
      router.replace("/dashboard");
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      toast.error(authErrorMessage(code, d));
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-semibold text-gradient-light">
          {d.auth.signUpTitle}
        </h1>
        <p className="mt-1.5 text-sm text-parch-100/60">
          {d.auth.signUpSubtitle}
        </p>
      </div>

      {!firebaseEnabled && (
        <div className="mb-6 rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm text-gold-200">
          {d.meta.name} portal isn&rsquo;t configured yet. Please check back
          soon.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field label={d.auth.name} htmlFor="name" required>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!firebaseEnabled || loading}
            required
          />
        </Field>

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

        <Field label={d.auth.phone} htmlFor="phone" required>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!firebaseEnabled || loading}
            required
          />
        </Field>

        <Field label={d.auth.companyOptional} htmlFor="company">
          <Input
            id="company"
            type="text"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={!firebaseEnabled || loading}
          />
        </Field>

        <Field label={d.auth.password} htmlFor="password" required>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!firebaseEnabled || loading}
              required
              minLength={8}
              className="pe-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-ink-500 transition-colors hover:text-parch-100"
            >
              {showPassword ? (
                <EyeOff className="h-4.5 w-4.5" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>
          </div>
        </Field>

        <Field label={d.auth.confirmPassword} htmlFor="confirmPassword" required>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={!firebaseEnabled || loading}
            required
            minLength={8}
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
          {loading ? d.auth.creatingAccount : d.auth.createAccount}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-parch-100/60">
        {d.auth.haveAccount}{" "}
        <Link
          href="/login"
          className="font-semibold text-gold-300 transition-colors hover:text-gold-200"
        >
          {d.auth.signIn}
        </Link>
      </p>

      <p className="mt-4 text-center text-xs leading-relaxed text-ink-500">
        {d.auth.agree}
      </p>
    </div>
  );
}
