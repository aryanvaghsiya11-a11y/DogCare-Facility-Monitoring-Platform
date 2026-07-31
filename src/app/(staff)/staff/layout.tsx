import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server-session";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/staff");

  return (
    <DashboardShell userRole="staff" userName={user.name}>
      {children}
    </DashboardShell>
  );
}
