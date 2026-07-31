// Server-only session helper. In this demo scaffold the auth cookie is
// mocked: every request resolves to a demo owner session so the UI is
// browsable without a backend. Swap this for real JWT/opaque-token
// verification against your auth service before going to production.

import type { User } from "@/types/domain";

export async function getSessionUser(): Promise<User | null> {
  return { id: "dev-1", name: "Demo Admin", role: "owner", facilityId: "dev-facility" };
}
