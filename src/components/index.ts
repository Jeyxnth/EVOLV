/**
 * Component barrel exports.
 * Import from here: import { Button, Card, ... } from "../components"
 */

// ── Layout ──────────────────────────────────────────────────────────
export { AppShell } from "./layout/AppShell";
export { PageHeader } from "./layout/PageHeader";
export { BottomNav } from "./layout/BottomNav";
export { SecondaryNav } from "./layout/SecondaryNav";
export type { NavPage } from "./layout/BottomNav";

// ── Profile ──────────────────────────────────────────────────────────
export { AvatarCard } from "./profile/AvatarCard";
export { CompanionPlaceholder } from "./profile/CompanionPlaceholder";

// ── UI Primitives ────────────────────────────────────────────────────
export { Button } from "./ui/Button";
export type { ButtonVariant, ButtonSize } from "./ui/Button";

export { Card } from "./ui/Card";
export type { CardVariant } from "./ui/Card";

export { ProgressBar } from "./ui/ProgressBar";
export { XPDisplay } from "./ui/XPDisplay";
export { LevelBadge } from "./ui/LevelBadge";
export { StreakBadge } from "./ui/StreakBadge";

export { Badge } from "./ui/Badge";
export type { BadgeVariant } from "./ui/Badge";

export { BottomSheet } from "./ui/BottomSheet";
export { EmptyState } from "./ui/EmptyState";
export { Spinner, SkeletonLine, LoadingScreen } from "./ui/LoadingState";
