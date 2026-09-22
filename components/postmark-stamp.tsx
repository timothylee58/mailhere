"use client";

import { motion, useReducedMotion } from "framer-motion";
import { stampIn } from "@/lib/motion";

const TONE_CLASS = {
  moss: "text-moss",
  stamp: "text-stamp",
} as const;

/**
 * The page's signature element: a rubber-stamp postmark that lands on a
 * notice once it's been processed. Registered mail, handled.
 */
export function PostmarkStamp({
  label,
  tone = "moss",
  className,
}: {
  label: string;
  tone?: keyof typeof TONE_CLASS;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 72 72"
      width={44}
      height={44}
      className={`pointer-events-none select-none ${TONE_CLASS[tone]} ${className ?? ""}`}
      variants={
        prefersReducedMotion
          ? { hidden: { opacity: 0 }, show: { opacity: 0.85, rotate: -8 } }
          : stampIn
      }
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      aria-hidden="true"
    >
      <circle
        cx="36"
        cy="36"
        r="33"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.9"
      />
      <circle
        cx="36"
        cy="36"
        r="27"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.7"
      />
      <text
        x="36"
        y="33"
        textAnchor="middle"
        fontSize="9"
        fontFamily="var(--font-mono)"
        letterSpacing="1"
        fill="currentColor"
        opacity="0.9"
      >
        {label}
      </text>
      <line
        x1="18"
        y1="42"
        x2="54"
        y2="42"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
      />
      <text
        x="36"
        y="52"
        textAnchor="middle"
        fontSize="7"
        fontFamily="var(--font-mono)"
        letterSpacing="1"
        fill="currentColor"
        opacity="0.75"
      >
        MAILHERE
      </text>
    </motion.svg>
  );
}
