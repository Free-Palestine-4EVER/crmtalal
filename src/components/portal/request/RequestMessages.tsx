"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useMessages } from "@/lib/hooks/data";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useI18n } from "@/i18n";
import { apiFetch } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

export function RequestMessages({ projectId }: { projectId: string }) {
  const { data: messages } = useMessages(projectId);
  const { profile } = useAuth();
  const { dict: d, locale } = useI18n();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await apiFetch(`/api/projects/${projectId}`, {
        body: { action: "message", text },
      });
      setText("");
    } catch {
      toast.error(d.common.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{d.dash.messages}</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="mb-4 max-h-96 space-y-3 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-500">
              {d.dash.noActivity}
            </p>
          ) : (
            messages.map((m) => {
              const mine = m.senderId === profile?.uid;
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex max-w-[82%] flex-col gap-1",
                    mine ? "ms-auto items-end" : "items-start",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {!mine && <Avatar name={m.senderName} size="sm" />}
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2 text-sm",
                        mine
                          ? "bg-gold-500/15 text-cream-50"
                          : "bg-ink-800 text-cream-100",
                      )}
                    >
                      {m.text}
                    </div>
                  </div>
                  <span className="text-[0.65rem] text-ink-500">
                    {m.senderName} · {timeAgo(m.at, locale)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`${d.common.send}…`}
            className="h-11 flex-1 rounded-xl border border-ink-700 bg-ink-850/60 px-4 text-sm text-cream-50 placeholder:text-ink-500 focus:border-gold-500/50 focus:outline-none"
          />
          <Button onClick={send} loading={sending} size="icon" aria-label={d.common.send}>
            {!sending && <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
