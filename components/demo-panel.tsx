"use client";

import { useAction } from "convex/react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SAMPLE = {
  subject: "SSM: Reminder to lodge annual return",
  text: "Dear Sir/Madam, this is a reminder from Suruhanjaya Syarikat Malaysia (SSM) that your company's Annual Return must be lodged within 30 days of your incorporation anniversary. Please submit via the MBRS portal by 15 October 2026. Late lodgement compounds may apply under the Companies Act 2016.",
};

export function DemoPanel() {
  const simulate = useAction(api.demo.simulateInbound);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await simulate({
        subject: String(fd.get("subject") ?? ""),
        text: String(fd.get("text") ?? ""),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Try it without email</CardTitle>
        <CardDescription>
          Push a sample notice through the same extraction pipeline the real
          inbox uses — watch it appear in the list below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" name="subject" defaultValue={SAMPLE.subject} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="text">Notice text</Label>
            <Textarea
              id="text"
              name="text"
              required
              rows={4}
              defaultValue={SAMPLE.text}
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" disabled={busy}>
            {busy ? "Sending…" : "Simulate forwarded notice"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
