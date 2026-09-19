"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { SignInForm } from "@/components/sign-in-form";
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  return (
    <main>
      <AuthLoading>
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      </AuthLoading>
      <Unauthenticated>
        <Landing />
      </Unauthenticated>
      <Authenticated>
        <Dashboard />
      </Authenticated>
    </main>
  );
}

function Landing() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 lg:flex-row lg:gap-16">
      <div className="max-w-lg space-y-5">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          MailHere
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          Never miss a regulator deadline again.
        </h1>
        <p className="text-lg text-muted-foreground">
          Forward notices from SSM, LHDN, KWSP or SOCSO to your MailHere inbox.
          We extract the deadline and required action, reply in plain language,
          and track everything on a live dashboard — plus we email you when new
          circulars affect your business.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>→ Forward a notice, get a plain-language summary back by email</li>
          <li>→ Live dashboard of deadlines and required actions</li>
          <li>→ Proactive alerts when new circulars match your registrations</li>
        </ul>
      </div>
      <SignInForm />
    </div>
  );
}
