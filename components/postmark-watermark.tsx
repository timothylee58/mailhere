// Large, static, decorative echo of the postmark-stamp signature motif —
// purely atmospheric, sits behind content at low opacity. Not the
// interactive components/postmark-stamp.tsx (which marks a notice done).
export function PostmarkWatermark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 72"
      className={`pointer-events-none select-none text-foreground ${className ?? ""}`}
      aria-hidden="true"
    >
      <circle cx="36" cy="36" r="33" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="36" cy="36" r="27" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <text
        x="36"
        y="32"
        textAnchor="middle"
        fontSize="6.5"
        fontFamily="var(--font-mono)"
        letterSpacing="1.5"
        fill="currentColor"
      >
        REGISTERED
      </text>
      <line x1="16" y1="40" x2="56" y2="40" stroke="currentColor" strokeWidth="0.5" />
      <text
        x="36"
        y="50"
        textAnchor="middle"
        fontSize="5.5"
        fontFamily="var(--font-mono)"
        letterSpacing="1.5"
        fill="currentColor"
      >
        MAILHERE
      </text>
    </svg>
  );
}
