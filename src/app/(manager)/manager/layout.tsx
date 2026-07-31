import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server-session";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/manager");
  return (
    <DashboardShell userRole="manager" userName={user.name}>
      {children}
    </DashboardShell>
  );
}
