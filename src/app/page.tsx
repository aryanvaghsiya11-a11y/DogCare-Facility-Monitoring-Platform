import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server-session";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/owner");
  }
  switch (user.role) {
    case "staff":
      redirect("/staff");
    case "owner":
      redirect("/owner");
    case "manager":
      redirect("/manager");
    default:
      redirect("/owner");
  }
}
