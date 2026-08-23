/**
 * Card — EVOLV reusable card component.
 *
 * Variants:
 *  default   — white with subtle shadow
 *  elevated  — slightly more prominent shadow
 *  soft      — tinted surface, no border
 *  glass     — frosted/translucent feel (for world/companion areas)
 *  outlined  — border only, minimal fill
 */
import type { HTMLAttributes, ReactNode } from "react";

export type CardVariant = "default" | "elevated" | "soft" | "glass" | "outlined";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  children: ReactNode;
  interactive?: boolean; // adds hover lift + cursor pointer
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-[var(--color-evolv-surface)] shadow-[var(--shadow-evolv-sm)] border border-[var(--color-evolv-border-soft)]",
  elevated:
    "bg-[var(--color-evolv-surface)] shadow-[var(--shadow-evolv-md)] border border-[var(--color-evolv-border-soft)]",
  soft:
    "bg-[var(--color-evolv-surface-raised)] border border-[var(--color-evolv-border-soft)]",
  glass:
    "bg-white/70 backdrop-blur-md border border-white/60 shadow-[var(--shadow-evolv-md)]",
  outlined:
    "bg-transparent border border-[var(--color-evolv-border)] shadow-none",
};

const paddingStyles = {
  none: "p-0",
  sm: "p-3",
  md: "p-[var(--space-evolv-card)]",
  lg: "p-5",
};

export function Card({
  variant = "default",
  padding = "md",
  interactive = false,
  children,
  className = "",
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={[
        "rounded-[var(--radius-evolv-card)]",
        variantStyles[variant],
        paddingStyles[padding],
        interactive
          ? "cursor-pointer transition-all duration-[var(--duration-evolv-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-evolv-md)] active:translate-y-0 active:shadow-[var(--shadow-evolv-sm)]"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
