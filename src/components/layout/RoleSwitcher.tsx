"use client";

import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/domain";

// Test/dev-only role switcher. Server-side role guards still run on every nav.
// In production this would be wrapped in a feature flag check.
export function RoleSwitcher() {
  const { user, switchRoleForTesting } = useAuth();
  if (!user || process.env.NODE_ENV === "production") return null;
  return (
    <label className="flex items-center gap-xs text-xs">
      <span className="sr-only">Switch role (dev only)</span>
      <select
        value={user.role}
        onChange={(e) => switchRoleForTesting(e.target.value as Role)}
        className="rounded-md border bg-white px-xs py-xs"
      >
        <option value="staff">Staff</option>
        <option value="owner">Owner</option>
        <option value="manager">Manager</option>
      </select>
    </label>
  );
}
