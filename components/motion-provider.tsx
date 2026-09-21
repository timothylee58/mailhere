"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode } from "react";
import {
  fadeInUp,
  reducedMotionVariants,
  staggerContainer,
} from "@/lib/motion";

function pickVariants(
  prefersReducedMotion: boolean | null,
  variants: Variants,
): Variants {
  return prefersReducedMotion ? reducedMotionVariants : variants;
}

export function MotionContainer({
  children,
  className,
  variants = staggerContainer,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={pickVariants(prefersReducedMotion, variants)}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({
  children,
  className,
  variants = fadeInUp,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={pickVariants(prefersReducedMotion, variants)}
    >
      {children}
    </motion.div>
  );
}

export function MotionFade({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
