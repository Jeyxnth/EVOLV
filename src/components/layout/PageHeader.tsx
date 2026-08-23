/**
 * PageHeader — reusable top bar for EVOLV pages.
 *
 * Slots:
 *  - Optional back button (left)
 *  - Title (center or left-aligned)
 *  - Right action slot (icon button, avatar, etc.)
 */
import type { ReactNode } from "react";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
  centerTitle?: boolean;
  transparent?: boolean; // no background — for hero/world pages
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  onBack,
  rightSlot,
  centerTitle = false,
  transparent = false,
  className = "",
}: PageHeaderProps) {
  return (
    <header
      className={[
        "relative flex items-center gap-3 px-4 py-3 shrink-0",
        transparent
          ? ""
          : "bg-[var(--color-evolv-surface)]/95 backdrop-blur-sm border-b border-[var(--color-evolv-border-soft)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Go back"
          className={[
            "shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
            "text-[var(--color-evolv-muted)] hover:text-[var(--color-evolv-ink)]",
            "hover:bg-[var(--color-evolv-border-soft)]",
            "transition-colors duration-[var(--duration-evolv-fast)]",
            "press-scale",
          ].join(" ")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M11 4L6 9l5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Title block */}
      {(title || subtitle) && (
        <div className={["flex-1 min-w-0", centerTitle ? "text-center" : ""].join(" ")}>
          {title && (
            <h1
              className={[
                "font-display font-bold text-[var(--color-evolv-ink)] leading-tight truncate",
                subtitle ? "text-[var(--text-evolv-md)]" : "text-[var(--text-evolv-lg)]",
              ].join(" ")}
            >
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] font-medium truncate">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Right slot */}
      {rightSlot && (
        <div className="shrink-0 ml-auto">{rightSlot}</div>
      )}
    </header>
  );
}
