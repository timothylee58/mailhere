"use client";

import type { Variants } from "framer-motion";

// Quiet, uniform entrance for ordinary UI. Motion here should be felt, not
// watched — the one moment worth watching is stampIn below.
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.15 } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: -4 },
  show: { opacity: 1, y: 0, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};

// The signature moment: a rubber stamp landing on a processed notice —
// registered mail, handled. Used once per state change, nowhere else.
export const stampIn: Variants = {
  hidden: { opacity: 0, scale: 1.6, rotate: -22 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: -8,
    transition: { type: "spring", stiffness: 420, damping: 18, mass: 0.6 },
  },
};
