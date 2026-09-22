"use client";

import { useConvexAuth } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { SignInForm } from "@/components/sign-in-form";
import { Dashboard } from "@/components/dashboard";
import {
  MotionContainer,
  MotionFade,
  MotionItem,
} from "@/components/motion-provider";
import { PostmarkWatermark } from "@/components/postmark-watermark";

export default function Home() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  let screen: "loading" | "auth" | "dashboard";
  if (isLoading) screen = "loading";
  else if (isAuthenticated) screen = "dashboard";
  else screen = "auth";

  return (
    <main>
      <AnimatePresence mode="wait" initial={false}>
        {screen === "loading" && (
          <MotionFade key="loading" className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
            Loading…
          </MotionFade>
        )}
        {screen === "auth" && <Landing key="auth" />}
        {screen === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Dashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function Landing() {
  return (
    <MotionFade key="auth" className="relative min-h-screen overflow-hidden">
      <PostmarkWatermark className="absolute -right-24 -top-24 size-[420px] opacity-[0.05] lg:size-[560px]" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 lg:flex-row lg:gap-16">
        <MotionContainer className="max-w-lg space-y-5">
          <MotionItem className="space-y-3">
            <p className="font-display text-xl font-semibold italic tracking-tight text-stamp">
              MailHere
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-balance">
              Never miss a regulator deadline again.
            </h1>
            <p className="text-lg text-muted-foreground">
              Forward notices from your tax office, companies registry, or
              social security authority to your MailHere inbox. We extract
              the deadline and required action, reply in plain language, and
              track everything on a live dashboard — plus we email you when
              new circulars affect your business.
            </p>
          </MotionItem>
          <MotionItem>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>→ Forward a notice, get a plain-language summary back by email</li>
              <li>→ Live dashboard of deadlines and required actions</li>
              <li>→ Proactive alerts when new circulars match your registrations</li>
            </ul>
          </MotionItem>
        </MotionContainer>
        <MotionItem>
          <SignInForm />
        </MotionItem>
      </div>
    </MotionFade>
  );
}
