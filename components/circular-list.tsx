"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { AGENCY_LABELS, formatDeadline } from "@/lib/agencies";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CircularList() {
  const circulars = useQuery(api.crawler.circularsForMe);
  const crawlNow = useAction(api.crawler.crawlNow);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    try {
      await crawlNow({});
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Regulator circulars</CardTitle>
          <CardDescription>
            Fresh items crawled from SSM, LHDN and KWSP that match your
            registrations — matches are emailed to you automatically.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={run} disabled={running}>
          {running ? "Crawling…" : "Crawl now"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {circulars === undefined ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : circulars.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing yet — hit &ldquo;Crawl now&rdquo; to pull the latest from the
            regulator sites.
          </p>
        ) : (
          circulars.map((c) => (
            <a
              key={c._id}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-md border p-4 transition-colors hover:bg-accent"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium">{c.title}</p>
                <Badge variant="outline" className="shrink-0">
                  {AGENCY_LABELS[c.agency]}
                </Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {c.summary}
              </p>
              {c.deadline && (
                <p className="mt-1 text-xs font-medium text-destructive">
                  Deadline: {formatDeadline(c.deadline)}
                </p>
              )}
            </a>
          ))
        )}
      </CardContent>
    </Card>
  );
}
