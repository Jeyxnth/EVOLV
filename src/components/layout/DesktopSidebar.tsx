/**
 * DesktopSidebar.tsx — Persistent sidebar navigation for tablet & desktop viewports (>= 768px).
 *
 * Provides:
 *  - EVOLV brand logo and tag
 *  - 5 primary navigation tabs (Home, Journey, World, Progress, Profile)
 *  - Active indicator pill with brand colors
 *  - Settings / Secondary menu trigger
 */
import type { ReactNode } from "react";
import type { NavPage } from "./BottomNav";

interface DesktopSidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  onOpenMenu?: () => void;
}

interface SidebarTab {
  id: NavPage;
  label: string;
  badge?: string;
  icon: (active: boolean) => ReactNode;
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.75}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
        strokeLinejoin="round"
      />
      <path
        d="M8 20v-7h6v7"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.75}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function JourneyIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle
        cx="11" cy="11" r="8"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.75}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M11 7v4.5l3 2"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WorldIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle
        cx="11" cy="11" r="8"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.75}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M3 11h16M11 3c-2 3-2 12 0 16M11 3c2 3 2 12 0 16"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProgressIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect
        x="3" y="3" width="16" height="16" rx="3"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.75}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M7 15l3-4 3 2 3-6"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle
        cx="11" cy="8" r="3.5"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.75}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
      <path
        d="M4 19c0-3.314 3.134-6 7-6s7 2.686 7 6"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

const TABS: SidebarTab[] = [
  { id: "home", label: "Home", icon: (a) => <HomeIcon active={a} /> },
  { id: "journey", label: "Journey", icon: (a) => <JourneyIcon active={a} /> },
  { id: "world", label: "World", icon: (a) => <WorldIcon active={a} /> },
  { id: "progress", label: "Progress", icon: (a) => <ProgressIcon active={a} /> },
  { id: "profile", label: "Profile", icon: (a) => <ProfileIcon active={a} /> },
];

const tabActiveColors: Record<NavPage, { text: string; bg: string; border: string }> = {
  home: {
    text: "var(--color-evolv-primary)",
    bg: "var(--color-evolv-primary-soft)",
    border: "var(--color-evolv-primary)",
  },
  journey: {
    text: "var(--color-evolv-mint-dark)",
    bg: "var(--color-evolv-mint-soft)",
    border: "var(--color-evolv-mint)",
  },
  world: {
    text: "var(--color-evolv-sky-dark)",
    bg: "var(--color-evolv-sky-soft)",
    border: "var(--color-evolv-sky)",
  },
  progress: {
    text: "var(--color-evolv-amber-dark)",
    bg: "var(--color-evolv-amber-soft)",
    border: "var(--color-evolv-amber)",
  },
  profile: {
    text: "var(--color-evolv-peach)",
    bg: "var(--color-evolv-peach-soft)",
    border: "var(--color-evolv-peach)",
  },
};

export function DesktopSidebar({ activePage, onNavigate, onOpenMenu }: DesktopSidebarProps) {
  return (
    <aside
      aria-label="Desktop navigation sidebar"
      className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-screen bg-[var(--color-evolv-surface)] border-r border-[var(--color-evolv-border-soft)] z-30 shadow-[var(--shadow-evolv-sm)]"
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-[var(--color-evolv-border-soft)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-evolv-primary-soft)] border border-[var(--color-evolv-primary-muted)] flex items-center justify-center shadow-[var(--shadow-evolv-sm)]">
            <span className="font-display font-extrabold text-[var(--text-evolv-lg)] text-[var(--color-evolv-primary)]">
              E
            </span>
          </div>
          <div>
            <span className="font-display font-extrabold text-[var(--text-evolv-lg)] text-[var(--color-evolv-ink)] tracking-tight">
              EVOLV
            </span>
            <p className="text-[11px] font-medium text-[var(--color-evolv-muted)] -mt-0.5">
              Student Wellbeing
            </p>
          </div>
        </div>

        {onOpenMenu && (
          <button
            onClick={onOpenMenu}
            aria-label="Open settings menu"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-evolv-border-soft)] text-[var(--color-evolv-muted)] transition-colors press-scale"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-evolv-muted-light)]">
          Main Menu
        </p>

        {TABS.map((tab) => {
          const active = activePage === tab.id;
          const colors = tabActiveColors[tab.id];

          return (
            <button
              key={tab.id}
              id={`desktop-nav-${tab.id}`}
              onClick={() => onNavigate(tab.id)}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              className={[
                "w-full flex items-center gap-3.5 px-3.5 py-3 rounded-[var(--radius-evolv-card)]",
                "text-left font-display font-semibold text-[var(--text-evolv-base)]",
                "transition-all duration-[var(--duration-evolv-base)] press-scale",
                active
                  ? "shadow-[var(--shadow-evolv-sm)] border"
                  : "text-[var(--color-evolv-muted)] hover:bg-[var(--color-evolv-border-soft)] hover:text-[var(--color-evolv-ink)] border border-transparent",
              ].join(" ")}
              style={
                active
                  ? {
                      background: colors.bg,
                      color: colors.text,
                      borderColor: colors.border,
                    }
                  : undefined
              }
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                style={
                  active
                    ? { color: colors.text }
                    : { color: "var(--color-evolv-muted)" }
                }
              >
                {tab.icon(active)}
              </div>
              <span className="flex-1 leading-none">{tab.label}</span>
              {active && (
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: colors.text }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Safety Badge */}
      <div className="p-4 border-t border-[var(--color-evolv-border-soft)] bg-[var(--color-evolv-surface-raised)]/50">
        <div className="p-3 rounded-xl bg-[var(--color-evolv-surface)] border border-[var(--color-evolv-border-soft)] flex items-center gap-2.5">
          <span className="text-lg">🌱</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-[var(--color-evolv-ink)] leading-tight truncate">
              Daily Growth
            </p>
            <p className="text-[10px] text-[var(--color-evolv-muted)] leading-tight truncate">
              Small steps, lasting habits
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
