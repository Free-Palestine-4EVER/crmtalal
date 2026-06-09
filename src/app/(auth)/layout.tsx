"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { TopoPattern } from "@/components/brand/TopoPattern";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/auth/AuthProvider";
import { roleHome } from "@/lib/roles";
import { useDict } from "@/i18n";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = useDict();
  const router = useRouter();
  const { loading, user, profile } = useAuth();

  // Already signed in with a profile → send to their home.
  useEffect(() => {
    if (!loading && user && profile) {
      router.replace(roleHome(profile.role));
    }
  }, [loading, user, profile, router]);

  if (loading) {
    return (
      <div className="bg-brand-radial relative flex min-h-dvh items-center justify-center">
        <Spinner className="h-8 w-8 text-gold-500" />
      </div>
    );
  }

  // Redirect in progress — avoid flashing the form behind it.
  if (user && profile) {
    return (
      <div className="bg-brand-radial relative flex min-h-dvh items-center justify-center">
        <Spinner className="h-8 w-8 text-gold-500" />
      </div>
    );
  }

  return (
    <div className="bg-brand-radial relative flex min-h-dvh flex-col overflow-hidden">
      <TopoPattern className="text-gold-500" opacity={0.15} />
      <div
        aria-hidden
        className="glow-gold pointer-events-none absolute inset-x-0 top-0 h-[42vh]"
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full text-sm font-medium text-parch-100/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 text-gold-500 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5" />
          {dict.auth.backToSite}
        </Link>
        <LanguageToggle />
      </header>

      {/* Centered shell */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="mb-7 flex justify-center">
            <Logo tone="official" priority />
          </div>

          <div className="glass rounded-2xl border border-white/10 p-8 shadow-elevated">
            {children}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
