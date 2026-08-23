/**
 * Button — EVOLV reusable button component.
 *
 * Variants:
 *  primary   — filled purple, main CTA
 *  secondary — mint green, positive action
 *  ghost     — transparent with border, subtle action
 *  soft      — light-tinted, low emphasis
 *  danger    — rose/peach, destructive action
 *
 * Sizes: sm | md | lg
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "soft" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-[var(--color-evolv-primary)] text-white",
    "hover:bg-[var(--color-evolv-primary-dark)]",
    "shadow-[var(--shadow-evolv-glow)]",
    "active:shadow-none",
  ].join(" "),

  secondary: [
    "bg-[var(--color-evolv-mint)] text-[var(--color-evolv-ink)]",
    "hover:bg-[var(--color-evolv-mint-dark)] hover:text-white",
    "shadow-[var(--shadow-evolv-mint-glow)]",
    "active:shadow-none",
  ].join(" "),

  ghost: [
    "bg-transparent text-[var(--color-evolv-primary)]",
    "border border-[var(--color-evolv-primary-soft)]",
    "hover:bg-[var(--color-evolv-primary-soft)]",
  ].join(" "),

  soft: [
    "bg-[var(--color-evolv-primary-soft)] text-[var(--color-evolv-primary)]",
    "hover:bg-[var(--color-evolv-primary-muted)] hover:text-white",
  ].join(" "),

  danger: [
    "bg-[var(--color-evolv-rose-soft)] text-[var(--color-evolv-rose)]",
    "border border-[var(--color-evolv-rose-soft)]",
    "hover:bg-[var(--color-evolv-rose)] hover:text-white",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-[var(--text-evolv-sm)] rounded-[var(--radius-evolv-md)]",
  md: "px-5 py-2.5 text-[var(--text-evolv-base)] rounded-[var(--radius-evolv-md)]",
  lg: "px-7 py-3.5 text-[var(--text-evolv-md)] rounded-[var(--radius-evolv-card)]",
};

export function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  fullWidth = false,
  loading = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center gap-2 font-semibold",
        "transition-all duration-[var(--duration-evolv-base)]",
        "press-scale select-none",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-evolv-primary)] focus-visible:outline-offset-2",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
