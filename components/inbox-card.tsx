"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function InboxCard() {
  const address = useQuery(api.email.inboxAddress);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your compliance inbox</CardTitle>
        <CardDescription>
          Forward any regulator notice to this address — from the contact
          email on your business profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 font-mono text-sm">
            {address ?? "Provisioning inbox…"}
          </code>
          <Button variant="outline" size="sm" onClick={copy} disabled={!address}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          We extract the agency, deadline and required action, then reply in
          plain language within a minute.
        </p>
      </CardContent>
    </Card>
  );
}
