"use client";

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { motion } from "framer-motion";
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
import type { Country } from "@/lib/agencies";

const MotionButton = motion(Button);

const SAMPLES: Record<Country, { subject: string; text: string }> = {
  MY: {
    subject: "SSM: Reminder to lodge annual return",
    text: "Dear Sir/Madam, this is a reminder from Suruhanjaya Syarikat Malaysia (SSM) that your company's Annual Return must be lodged within 30 days of your incorporation anniversary. Please submit via the MBRS portal by 15 October 2026. Late lodgement compounds may apply under the Companies Act 2016.",
  },
  US: {
    subject: "IRS: Estimated tax payment reminder",
    text: "This is a reminder from the Internal Revenue Service that your Q3 estimated tax payment is due. Please submit payment via EFTPS or IRS Direct Pay by 15 October 2026. Penalties may apply for late or underpaid estimated tax.",
  },
  UK: {
    subject: "HMRC: Corporation Tax return due",
    text: "This is a reminder from HM Revenue & Customs that your Corporation Tax return (CT600) is due. Please file online via your HMRC business account by 15 October 2026. Penalties apply for late filing under the Finance Act.",
  },
  SG: {
    subject: "ACRA: Annual return filing reminder",
    text: "This is a reminder from the Accounting and Corporate Regulatory Authority (ACRA) that your company's Annual Return must be filed within 7 months of financial year end. Please submit via BizFile+ by 15 October 2026. Late filing penalties apply under the Companies Act.",
  },
};

export function DemoPanel({ country }: { country: Country }) {
  const simulate = useAction(api.demo.simulateInbound);
  const [busy, setBusy] = useState(false);
  const sample = SAMPLES[country] ?? SAMPLES.MY;

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
        <form key={country} onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" name="subject" defaultValue={sample.subject} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="text">Notice text</Label>
            <Textarea
              id="text"
              name="text"
              required
              rows={4}
              defaultValue={sample.text}
            />
          </div>
          <MotionButton
            type="submit"
            variant="secondary"
            size="sm"
            disabled={busy}
            whileTap={{ scale: 0.98 }}
          >
            {busy ? "Sending…" : "Simulate forwarded notice"}
          </MotionButton>
        </form>
      </CardContent>
    </Card>
  );
}
