/**
 * BottomSheet — responsive slide-up sheet (mobile) and centered dialog (desktop) for EVOLV.
 *
 * Used for:
 *  - Mission detail / play-style post-completion interaction overlay
 *  - Play-style switcher
 *  - Activity logging and target editing
 *  - Confirmation dialogs
 */
import { useEffect, type ReactNode } from "react";

interface BottomSheetProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Max height as a fraction of viewport — default 0.85 */
  maxHeightFraction?: number;
}

export function BottomSheet({
  open,
  isOpen,
  onClose,
  title,
  children,
  maxHeightFraction = 0.85,
}: BottomSheetProps) {
  const isVisible = open ?? isOpen ?? false;

  // Lock body scroll while open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  // Escape key handler
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <>
      {/* Full-viewport Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--color-evolv-ink)]/45 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet (Mobile: bottom-aligned slide-up; Desktop: centered floating dialog) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Dialog panel"}
        className={[
          "fixed z-50 flex flex-col bg-[var(--color-evolv-surface)] shadow-[var(--shadow-evolv-lg)]",
          /* Mobile styles */
          "bottom-0 inset-x-0 rounded-t-[var(--radius-evolv-xl)] animate-slide-up safe-bottom",
          /* Tablet/Desktop centered dialog styles */
          "md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
          "md:w-full md:max-w-lg md:rounded-[var(--radius-evolv-xl)] md:border md:border-[var(--color-evolv-border-soft)]",
          "md:animate-bounce-in md:shadow-[0_20px_60px_rgba(37,32,64,0.20)]",
        ].join(" ")}
        style={{ maxHeight: `${maxHeightFraction * 100}dvh` }}
      >
        {/* Drag handle (Mobile only) */}
        <div className="flex md:hidden justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[var(--color-evolv-border)]" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-5 pt-3 md:pt-4 pb-3 flex items-center justify-between shrink-0 border-b border-[var(--color-evolv-border-soft)]">
            <h2 className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)]">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-evolv-border-soft)] text-[var(--color-evolv-muted)] transition-colors press-scale"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-8 scroll-smooth">
          {children}
        </div>
      </div>
    </>
  );
}
