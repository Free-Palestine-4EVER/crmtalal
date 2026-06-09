"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/form";
import { auth, firebaseEnabled } from "@/lib/firebase/client";
import { describeAuthError } from "@/lib/auth/firebaseErrors";
import { apiFetch } from "@/lib/api";
import { useDict } from "@/i18n";
import { cn } from "@/lib/cn";

export default function LoginPage() {
  const d = useDict();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const busy = loading || googleLoading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseEnabled || busy) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Self-heal: ensure the Firestore profile exists (covers accounts whose
      // profile failed to create at registration). Idempotent; non-blocking.
      try {
        await apiFetch("/api/auth/register", { body: {} });
      } catch {
        /* profile likely already exists */
      }
      router.replace("/dashboard");
    } catch (err) {
      toast.error(describeAuthError(err, d));
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!firebaseEnabled || busy) return;
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      // Ensure a profile document exists for first-time Google sign-ins.
      await apiFetch("/api/auth/register", { body: {} });
      router.replace("/dashboard");
    } catch (err) {
      toast.error(describeAuthError(err, d));
      setGoogleLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-semibold text-gradient-light">
          {d.auth.signInTitle}
        </h1>
        <p className="mt-1.5 text-sm text-parch-100/60">
          {d.auth.signInSubtitle}
        </p>
      </div>

      {!firebaseEnabled && (
        <div className="mb-6 rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm text-gold-200">
          {d.meta.name} portal isn&rsquo;t configured yet. Please check back
          soon.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field label={d.auth.email} htmlFor="email" required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!firebaseEnabled || busy}
            required
            placeholder="you@example.com"
          />
        </Field>

        <Field label={d.auth.password} htmlFor="password" required>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!firebaseEnabled || busy}
              required
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

        <div className="-mt-1 flex justify-end">
          <Link
            href="/forgot"
            className="text-xs font-medium text-gold-300 transition-colors hover:text-gold-200"
          >
            {d.auth.forgotPassword}
          </Link>
        </div>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          loading={loading}
          disabled={!firebaseEnabled || busy}
          className="mt-1 w-full"
        >
          {loading ? d.auth.signingIn : d.auth.signIn}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-ink-700" />
        <span className="text-xs uppercase tracking-wider text-ink-500">
          {d.auth.orContinue}
        </span>
        <span className="h-px flex-1 bg-ink-700" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        loading={googleLoading}
        disabled={!firebaseEnabled || busy}
        onClick={handleGoogle}
        className="w-full"
      >
        {!googleLoading && <GoogleGlyph />}
        {d.auth.googleSignIn}
      </Button>

      <p className="mt-7 text-center text-sm text-parch-100/60">
        {d.auth.noAccount}{" "}
        <Link
          href="/register"
          className={cn(
            "font-semibold text-gold-300 transition-colors hover:text-gold-200",
          )}
        >
          {d.auth.signUp}
        </Link>
      </p>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.27a12 12 0 0 0 0 10.76l4-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.96 11.96 0 0 0 12 0 12 12 0 0 0 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}
