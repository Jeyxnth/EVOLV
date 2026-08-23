/**
 * SecondaryNav — slide-in drawer for secondary navigation options.
 *
 * Opened from: hamburger icon in Profile header, desktop sidebar, or top-right of pages.
 * Contains: Settings, Safety/Help, Account, About.
 */
import { useEffect } from "react";

interface SecondaryNavItem {
  id: string;
  icon: string;
  label: string;
  description?: string;
  danger?: boolean;
  onClick: () => void;
}

interface SecondaryNavProps {
  open: boolean;
  onClose: () => void;
}

export function SecondaryNav({ open, onClose }: SecondaryNavProps) {
  // Lock scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const items: SecondaryNavItem[] = [
    {
      id: "settings",
      icon: "⚙️",
      label: "Settings",
      description: "Notifications, preferences",
      onClick: onClose,
    },
    {
      id: "safety",
      icon: "🛡️",
      label: "Safety & Help",
      description: "Resources and support",
      onClick: onClose,
    },
    {
      id: "account",
      icon: "👤",
      label: "Account",
      description: "Sign in or manage your account",
      onClick: onClose,
    },
    {
      id: "about",
      icon: "✨",
      label: "About EVOLV",
      description: "Version and credits",
      onClick: onClose,
    },
  ];

  if (!open) return null;

  return (
    <>
      {/* Full-viewport Overlay */}
      <div
        className="fixed inset-0 bg-[var(--color-evolv-ink)]/45 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer — slides from right */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings menu"
        className={[
          "fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[85vw]",
          "bg-[var(--color-evolv-surface)]",
          "shadow-[var(--shadow-evolv-lg)]",
          "border-l border-[var(--color-evolv-border-soft)]",
          "flex flex-col",
          "animate-slide-in-right",
          "safe-top safe-bottom",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--color-evolv-border-soft)]">
          <div>
            <p className="font-display font-bold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)]">
              Menu
            </p>
            <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)]">
              EVOLV Settings & Resources
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-evolv-muted)] hover:bg-[var(--color-evolv-border-soft)] hover:text-[var(--color-evolv-ink)] transition-colors press-scale"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3">
          {items.map((item) => (
            <button
              key={item.id}
              id={`secondary-nav-${item.id}`}
              onClick={item.onClick}
              className={[
                "w-full flex items-center gap-3 px-5 py-3.5",
                "text-left transition-colors duration-[var(--duration-evolv-fast)] press-scale",
                item.danger
                  ? "hover:bg-[var(--color-evolv-rose-soft)] text-[var(--color-evolv-rose)]"
                  : "hover:bg-[var(--color-evolv-border-soft)] text-[var(--color-evolv-ink)]",
              ].join(" ")}
            >
              <span className="text-xl w-7 text-center shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--text-evolv-base)] leading-tight">
                  {item.label}
                </p>
                {item.description && (
                  <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-[var(--color-evolv-muted-light)] shrink-0"
                aria-hidden="true"
              >
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--color-evolv-border-soft)] bg-[var(--color-evolv-surface-raised)]/50">
          <p className="text-[var(--text-evolv-xs)] text-[var(--color-evolv-muted)] text-center">
            EVOLV is not a medical diagnosis system.
          </p>
        </div>
      </div>
    </>
  );
}
