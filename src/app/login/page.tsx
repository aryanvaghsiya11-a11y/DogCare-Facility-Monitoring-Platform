import { LoginForm } from "@/features/auth/LoginForm";

export default function Page({ searchParams }: { searchParams: { next?: string } }) {
  return <LoginForm nextPath={searchParams.next} />;
}
