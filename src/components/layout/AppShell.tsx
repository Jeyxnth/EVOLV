/**
 * AppShell — outermost responsive layout container for EVOLV.
 *
 * Responsibilities:
 *  - Mobile (< 768px): Full-height mobile viewport with fixed BottomNav and safe areas.
 *  - Tablet & Desktop (>= 768px): Full viewport with DesktopSidebar on the left,
 *    centered comfortable content container (max-w-6xl), and smooth independent scrolling.
 *  - SecondaryNav (drawer) management across all viewports.
 */
import { useState, type ReactNode } from "react";
import { BottomNav, type NavPage } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { SecondaryNav } from "./SecondaryNav";

interface AppShellProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  children: ReactNode;
}

export function AppShell({ activePage, onNavigate, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-dvh w-full bg-[var(--color-evolv-bg)] flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar (visible on md:) */}
      <DesktopSidebar
        activePage={activePage}
        onNavigate={onNavigate}
        onOpenMenu={() => setDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-dvh md:h-screen min-w-0 overflow-hidden relative">
        {/* Scrollable page body */}
        <main
          id="main-content"
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth"
        >
          {/* Constrained responsive inner wrapper */}
          <div className="w-full max-w-5xl lg:max-w-6xl mx-auto min-h-full flex flex-col">
            {children}
          </div>
        </main>

        {/* Bottom Navigation (Mobile only, hidden on md:) */}
        <BottomNav
          activePage={activePage}
          onNavigate={onNavigate}
        />

        {/* Secondary Nav Drawer (accessible on both mobile and desktop) */}
        <SecondaryNav
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    </div>
  );
}
