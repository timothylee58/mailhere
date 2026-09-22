"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  AGENCY_LABELS,
  agenciesForCountry,
  COUNTRIES,
  COUNTRY_LABELS,
  type Country,
} from "@/lib/agencies";
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
import { Select } from "@/components/ui/select";

export function BusinessSetup() {
  const upsert = useMutation(api.businesses.upsertMine);
  const [country, setCountry] = useState<Country>("MY");
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const agencies = agenciesForCountry(country);

  const changeCountry = (next: Country) => {
    setCountry(next);
    setCategories(new Set());
  };

  const toggle = (code: string) =>
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (categories.size === 0) {
      setError("Pick at least one regulator your business deals with.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await upsert({
        name: String(fd.get("name") ?? ""),
        country,
        registrationNo: String(fd.get("registrationNo") ?? "") || undefined,
        contactEmail: String(fd.get("contactEmail") ?? ""),
        categories: [...categories],
      });
    } catch {
      setError("Could not save your business. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-16">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Register your business
        </h1>
        <p className="text-sm text-muted-foreground">
          MailHere matches circulars and replies using these details.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Business profile</CardTitle>
          <CardDescription>
            Select every regulator you are registered with — we only alert you
            about the ones that apply to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Business name</Label>
              <Input id="name" name="name" required placeholder="Acme Sdn Bhd" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Select
                id="country"
                name="country"
                value={country}
                onChange={(e) => changeCountry(e.target.value as Country)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {COUNTRY_LABELS[c]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="registrationNo">
                Business registration no. (optional)
              </Label>
              <Input id="registrationNo" name="registrationNo" placeholder="202301012345" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail">Contact email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                required
                placeholder="owner@company.com"
              />
              <p className="text-xs text-muted-foreground">
                Replies and alerts go here. Forward notices from this address so
                we can match them to your business.
              </p>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">
                Regulators in {COUNTRY_LABELS[country]}
              </legend>
              <div className="flex flex-wrap gap-2">
                {agencies.map((a) => (
                  <motion.button
                    key={a.code}
                    type="button"
                    layout
                    onClick={() => toggle(a.code)}
                    aria-pressed={categories.has(a.code)}
                    whileTap={{ scale: 0.94 }}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      categories.has(a.code)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background hover:bg-accent"
                    }`}
                  >
                    {AGENCY_LABELS[a.code] ?? a.label}
                  </motion.button>
                ))}
              </div>
            </fieldset>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving…" : "Save and open dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
