export type Role = "staff" | "owner" | "manager";

export type Severity = "critical" | "high" | "normal";

export interface User {
  id: string;
  name: string;
  role: Role;
  facilityId: string;
}

export interface Dog {
  id: string;
  name: string;
  ownerId: string;
  zone: string;
  activityScore: number; // 0-100
  feedingStatus: "on_track" | "overdue" | "skipped";
  photoUrl?: string;
}

export interface Alert {
  id: string;
  severity: Severity;
  type: string; // e.g. "fight", "escape", "feeding_overdue"
  message: string;
  dogIds: string[];
  clipUrl?: string;
  createdAt: string; // ISO
  acknowledged: boolean;
}

export interface Incident {
  id: string;
  alertId: string;
  dogIds: string[];
  notes: string;
  resolved: boolean;
  createdAt: string;
  severity?: Severity;
  dogName?: string;
  // Seeded age of the incident (not Date.now()) so the rendered "when"
  // column is stable across server render, hydration, and reloads.
  minutesAgo: number;
}

export interface ComplianceItem {
  id: string;
  label: string;
  shift: "morning" | "afternoon" | "evening";
  completed: boolean;
}

export type TaskCategory = "feeding" | "medication" | "walk" | "grooming" | "playtime";

export interface CareTask {
  id: string;
  dogId: string;
  title: string;
  category: TaskCategory;
  scheduledTime: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}
