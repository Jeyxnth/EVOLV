/**
 * Badge — generic status, category, or reward badge.
 *
 * Variants map to EVOLV palette tokens.
 */
import type { ReactNode } from "react";

export type BadgeVariant =
  | "primary"
  | "mint"
  | "amber"
  | "sky"
  | "peach"
  | "rose"
  | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: "xs" | "sm" | "md";
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary:
    "bg-[var(--color-evolv-primary-soft)] text-[var(--color-evolv-primary)]",
  mint:
    "bg-[var(--color-evolv-mint-soft)] text-[var(--color-evolv-mint-dark)]",
  amber:
    "bg-[var(--color-evolv-amber-soft)] text-[var(--color-evolv-amber-dark)]",
  sky:
    "bg-[var(--color-evolv-sky-soft)] text-[var(--color-evolv-sky-dark)]",
  peach:
    "bg-[var(--color-evolv-peach-soft)] text-[var(--color-evolv-peach)]",
  rose:
    "bg-[var(--color-evolv-rose-soft)] text-[var(--color-evolv-rose)]",
  neutral:
    "bg-[var(--color-evolv-border-soft)] text-[var(--color-evolv-muted)]",
};

const sizeStyles = {
  xs: "px-1.5 py-0.5 text-[var(--text-evolv-xs)] gap-1",
  sm: "px-2.5 py-1 text-[var(--text-evolv-xs)] gap-1",
  md: "px-3 py-1.5 text-[var(--text-evolv-sm)] gap-1.5",
};

export function Badge({
  variant = "neutral",
  size = "sm",
  icon,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center font-semibold rounded-[var(--radius-evolv-pill)]",
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(" ")}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
