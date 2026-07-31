import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server-session";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/owner");
  return (
    <DashboardShell userRole="owner" userName={user.name}>
      {children}
    </DashboardShell>
  );
}
