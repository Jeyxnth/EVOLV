/**
 * EmptyState — displayed when a section has no content yet.
 */
import type { ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center py-10 px-6",
        className,
      ].join(" ")}
    >
      {icon && (
        <div className="mb-4 w-16 h-16 rounded-full bg-[var(--color-evolv-primary-soft)] flex items-center justify-center text-3xl">
          {icon}
        </div>
      )}
      <h3 className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-[var(--text-evolv-sm)] text-[var(--color-evolv-muted)] max-w-[240px] leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          variant="soft"
          size="sm"
          className="mt-5"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
