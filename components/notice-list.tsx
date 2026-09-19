"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { AGENCY_LABELS, daysUntil, formatDeadline } from "@/lib/agencies";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATUS_VARIANTS: Record<
  string,
  { label: string; variant: "secondary" | "default" | "success" | "warning" | "destructive" }
> = {
  received: { label: "Received", variant: "secondary" },
  parsing: { label: "Parsing…", variant: "secondary" },
  parsed: { label: "Parsed", variant: "default" },
  replied: { label: "Replied", variant: "success" },
  needs_review: { label: "Needs review", variant: "warning" },
  failed: { label: "Failed", variant: "destructive" },
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "EN",
  ms: "BM",
  zh: "中文",
};

type Group = "overdue" | "upcoming" | "done";

function groupOf(n: Doc<"notices">): Group {
  if (n.resolvedAt) return "done";
  if (n.deadline && n.deadline < Date.now()) return "overdue";
  return "upcoming";
}

const GROUP_LABELS: Record<Group, string> = {
  overdue: "Overdue",
  upcoming: "Upcoming",
  done: "Done",
};

function NoticeCard({ notice }: { notice: Doc<"notices"> }) {
  const setResolved = useMutation(api.notices.setResolved);
  const status = STATUS_VARIANTS[notice.status] ?? STATUS_VARIANTS.received;
  const days = daysUntil(notice.deadline);
  const isDone = !!notice.resolvedAt;
  const isDemo = notice.threadId.startsWith("demo-");

  return (
    <div className="rounded-md border p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{notice.subject}</p>
          <p className="text-xs text-muted-foreground">
            {isDemo ? "demo" : `via email · ${notice.senderDomain}`} ·{" "}
            {new Date(notice.receivedAt).toLocaleString("en-MY")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {notice.language && LANGUAGE_LABELS[notice.language] && (
            <Badge variant="outline">{LANGUAGE_LABELS[notice.language]}</Badge>
          )}
          {notice.agency && (
            <Badge variant="outline">{AGENCY_LABELS[notice.agency]}</Badge>
          )}
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </div>
      {notice.summary && (
        <p className="text-sm text-muted-foreground">{notice.summary}</p>
      )}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        {notice.deadline && (
          <span>
            <span className="text-muted-foreground">Deadline: </span>
            <span className={days !== null && days <= 7 ? "font-semibold text-destructive" : "font-medium"}>
              {formatDeadline(notice.deadline)}
              {days !== null && ` (${days}d)`}
            </span>
          </span>
        )}
        {notice.requiredAction && (
          <span>
            <span className="text-muted-foreground">Action: </span>
            {notice.requiredAction}
          </span>
        )}
        <button
          type="button"
          onClick={() => void setResolved({ noticeId: notice._id, resolved: !isDone })}
          aria-pressed={isDone}
          className="ml-auto rounded border border-input px-2 py-0.5 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isDone ? "Reopen" : "Mark done"}
        </button>
      </div>
      {notice.replyText && (
        <details className="text-sm">
          <summary className="cursor-pointer text-primary">Reply sent</summary>
          <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-3 text-muted-foreground">
            {notice.replyText}
          </p>
        </details>
      )}
      {notice.error && (
        <p className="text-xs text-destructive">{notice.error}</p>
      )}
    </div>
  );
}

export function NoticeList() {
  const notices = useQuery(api.notices.listMine);

  const groups: Record<Group, Doc<"notices">[]> = {
    overdue: [],
    upcoming: [],
    done: [],
  };
  for (const n of notices ?? []) groups[groupOf(n)].push(n);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance items</CardTitle>
        <CardDescription>
          Forwarded notices land here live — grouped by deadline.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notices === undefined ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No notices yet — forward one to your inbox address above, or use the
            demo panel.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {(["overdue", "upcoming", "done"] as const).map((g) => (
              <section key={g} aria-label={GROUP_LABELS[g]} className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  {GROUP_LABELS[g]}
                  <Badge variant="secondary">{groups[g].length}</Badge>
                </h3>
                {groups[g].length === 0 ? (
                  <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                    Nothing here
                  </p>
                ) : (
                  groups[g].map((n) => <NoticeCard key={n._id} notice={n} />)
                )}
              </section>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
