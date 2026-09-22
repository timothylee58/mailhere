"use client";

import { useAction, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";
import { AGENCY_LABELS, COUNTRY_LABELS, daysUntil, formatDeadline } from "@/lib/agencies";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BusinessSetup } from "@/components/business-setup";
import { CircularList } from "@/components/circular-list";
import { DemoPanel } from "@/components/demo-panel";
import { InboxCard } from "@/components/inbox-card";
import { NoticeList } from "@/components/notice-list";
import { MotionContainer, MotionItem } from "@/components/motion-provider";

export function Dashboard() {
  const business = useQuery(api.businesses.mine);
  const upcoming = useQuery(
    api.notices.upcoming,
    business ? {} : "skip",
  );
  const ensureSetup = useAction(api.setup.ensureSetup);
  const { signOut } = useAuthActions();
  const setupStarted = useRef(false);

  useEffect(() => {
    if (business && !setupStarted.current) {
      setupStarted.current = true;
      void ensureSetup({});
    }
  }, [business, ensureSetup]);

  if (business === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (business === null) {
    return (
      <MotionContainer className="mx-auto max-w-6xl px-6 py-8">
        <MotionItem>
          <BusinessSetup />
        </MotionItem>
      </MotionContainer>
    );
  }

  const next = upcoming?.[0];

  return (
    <MotionContainer className="mx-auto max-w-6xl px-6 py-8">
      <MotionItem>
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold italic tracking-tight text-stamp">
              MailHere
            </h1>
            <p className="text-sm text-muted-foreground">
              {business.name} · {COUNTRY_LABELS[business.country]} ·{" "}
              {business.categories.map((c) => AGENCY_LABELS[c]).join(" · ")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {next?.deadline && (
              <Badge variant="warning">
                Next deadline: {formatDeadline(next.deadline)} (
                {daysUntil(next.deadline)}d)
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </header>
      </MotionItem>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <MotionItem>
            <InboxCard />
          </MotionItem>
          <MotionItem>
            <DemoPanel country={business.country} />
          </MotionItem>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <MotionItem>
            <NoticeList />
          </MotionItem>
          <MotionItem>
            <CircularList />
          </MotionItem>
        </div>
      </div>
    </MotionContainer>
  );
}
