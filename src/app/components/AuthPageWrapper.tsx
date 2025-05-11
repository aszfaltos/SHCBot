"use client";

import { useSearchParams } from "next/navigation";
import AuthForm from "@/components/AuthForm";

export default function AuthPageWrapper() {
  const searchParams = useSearchParams();

  const mode = (
    ["login", "register"].includes(searchParams.get("mode") ?? "")
      ? searchParams.get("mode")
      : "login"
  ) as "login" | "register";

  return <AuthForm initialMode={mode} />;
}
