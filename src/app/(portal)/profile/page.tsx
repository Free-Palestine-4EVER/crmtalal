"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/portal/PageHeader";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Field, Input } from "@/components/ui/form";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useI18n } from "@/i18n";
import { apiFetch } from "@/lib/api";
import { fmtDate } from "@/lib/format";

export default function ProfilePage() {
  const { profile } = useAuth();
  const { dict, locale } = useI18n();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);

  // Seed the form once the realtime profile lands (and re-sync on changes).
  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setPhone(profile.phone ?? "");
    setCompany(profile.company ?? "");
  }, [profile]);

  if (!profile) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Spinner className="h-7 w-7 text-gold-500" />
      </div>
    );
  }

  const dirty =
    name.trim() !== (profile.name ?? "") ||
    phone.trim() !== (profile.phone ?? "") ||
    company.trim() !== (profile.company ?? "");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await apiFetch("/api/profile", {
        body: {
          name: name.trim(),
          phone: phone.trim(),
          company: company.trim(),
          locale: profile.locale ?? locale,
        },
      });
      toast.success(dict.profile.updated);
    } catch {
      toast.error(dict.common.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader icon={User} title={dict.profile.title} />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
        {/* Identity card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="relative overflow-hidden">
            <span
              aria-hidden
              className="glow-maroon pointer-events-none absolute inset-x-0 -top-10 h-32"
            />
            <CardBody className="relative flex flex-col items-center text-center">
              <Avatar
                name={profile.name}
                src={profile.photoURL}
                ring
                className="h-20 w-20 text-xl"
              />
              <h2 className="mt-4 text-lg font-semibold text-cream-50">
                {profile.name}
              </h2>
              <Badge tone="gold" className="mt-2" dot>
                {dict.roles[profile.role]}
              </Badge>
              {profile.title && (
                <p className="mt-2 text-sm text-ink-500">{profile.title}</p>
              )}

              <div className="mt-6 w-full space-y-3 border-t border-ink-700/70 pt-5 text-start">
                <InfoLine icon={Mail} label={dict.profile.email}>
                  <span className="truncate">{profile.email}</span>
                </InfoLine>
                <InfoLine icon={CalendarDays} label={dict.profile.memberSince}>
                  {fmtDate(profile.createdAt, locale)}
                </InfoLine>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Editable details */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{dict.profile.personalInfo}</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={save} className="space-y-4">
                <Field label={dict.profile.fullName} htmlFor="name" required>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </Field>

                <Field label={dict.profile.email} htmlFor="email">
                  <Input
                    id="email"
                    value={profile.email}
                    type="email"
                    disabled
                    readOnly
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={dict.profile.phone} htmlFor="phone">
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      dir="ltr"
                      autoComplete="tel"
                      className="text-start"
                    />
                  </Field>
                  <Field label={dict.profile.company} htmlFor="company">
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      autoComplete="organization"
                    />
                  </Field>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    loading={saving}
                    disabled={!dirty || !name.trim()}
                  >
                    {dict.profile.saveChanges}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function InfoLine({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink-800 text-gold-400">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.72rem] text-ink-500">{label}</span>
        <span className="block truncate text-cream-100/90">{children}</span>
      </span>
    </div>
  );
}
