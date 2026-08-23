/**
 * BottomNav — primary 5-tab navigation for EVOLV.
 *
 * Tabs: Home | Journey | World | Progress | Profile
 *
 * Design:
 *  - Fixed to bottom of the mobile shell
 *  - Active tab: filled pill indicator + colored icon
 *  - Subtle scale animation on press
 *  - Safe-area aware
 */
import type { ReactNode } from "react";

export type NavPage = "home" | "journey" | "world" | "progress" | "profile";

interface NavTab {
  id: NavPage;
  label: string;
  icon: (active: boolean) => ReactNode;
}

interface BottomNavProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
}

/* ── SVG Icons ──────────────────────────────────────────────────────────── */

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
        strokeLinejoin="round"
      />
      <path
        d="M8 20v-7h6v7"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function JourneyIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle
        cx="11" cy="11" r="8"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M11 7v4.5l3 2"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WorldIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle
        cx="11" cy="11" r="8"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M3 11h16M11 3c-2 3-2 12 0 16M11 3c2 3 2 12 0 16"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProgressIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect
        x="3" y="3" width="16" height="16" rx="3"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M7 15l3-4 3 2 3-6"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle
        cx="11" cy="8" r="3.5"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
      <path
        d="M4 19c0-3.314 3.134-6 7-6s7 2.686 7 6"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Tab definitions ────────────────────────────────────────────────────── */

const TABS: NavTab[] = [
  { id: "home", label: "Home", icon: (a) => <HomeIcon active={a} /> },
  { id: "journey", label: "Journey", icon: (a) => <JourneyIcon active={a} /> },
  { id: "world", label: "World", icon: (a) => <WorldIcon active={a} /> },
  { id: "progress", label: "Progress", icon: (a) => <ProgressIcon active={a} /> },
  { id: "profile", label: "Profile", icon: (a) => <ProfileIcon active={a} /> },
];

/* ── Active color per tab ───────────────────────────────────────────────── */
const activeColors: Record<NavPage, string> = {
  home: "var(--color-evolv-primary)",
  journey: "var(--color-evolv-mint-dark)",
  world: "var(--color-evolv-sky-dark)",
  progress: "var(--color-evolv-amber-dark)",
  profile: "var(--color-evolv-peach)",
};

const activeBgColors: Record<NavPage, string> = {
  home: "var(--color-evolv-primary-soft)",
  journey: "var(--color-evolv-mint-soft)",
  world: "var(--color-evolv-sky-soft)",
  progress: "var(--color-evolv-amber-soft)",
  profile: "var(--color-evolv-peach-soft)",
};

/* ── Component ──────────────────────────────────────────────────────────── */

export function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className={[
        "md:hidden shrink-0 flex items-stretch",
        "bg-[var(--color-evolv-surface)]/95 backdrop-blur-md",
        "border-t border-[var(--color-evolv-border-soft)]",
        "shadow-[0_-4px_20px_rgba(37,32,64,0.06)]",
        "safe-bottom",
      ].join(" ")}
    >
      {TABS.map((tab) => {
        const active = activePage === tab.id;
        const color = active ? activeColors[tab.id] : "var(--color-evolv-muted-light)";
        const bgColor = active ? activeBgColors[tab.id] : "transparent";

        return (
          <button
            key={tab.id}
            id={`nav-${tab.id}`}
            onClick={() => onNavigate(tab.id)}
            aria-label={tab.label}
            aria-current={active ? "page" : undefined}
            className={[
              "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-1",
              "transition-all duration-[var(--duration-evolv-base)]",
              "press-scale",
              "focus-visible:outline-2 focus-visible:outline-[var(--color-evolv-primary)] focus-visible:outline-offset-2",
            ].join(" ")}
          >
            {/* Icon pill */}
            <div
              className="w-10 h-6 rounded-[var(--radius-evolv-pill)] flex items-center justify-center transition-all duration-[var(--duration-evolv-base)]"
              style={{ background: bgColor, color }}
            >
              {tab.icon(active)}
            </div>

            {/* Label */}
            <span
              className="text-[10px] font-semibold leading-none transition-colors duration-[var(--duration-evolv-base)]"
              style={{ color }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
