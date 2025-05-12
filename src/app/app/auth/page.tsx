"use client";

import { Suspense, useEffect, useState } from "react";
import AuthPageWrapper from "@/components/AuthPageWrapper";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";
import Link from "next/link";

export default function AuthPage() {
  const [mounted, setIsMounted] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-t from-violet-800 to-purple-700 dark:from-violet-900 dark:to-purple-900">
      {user ? (
        <div
          className={clsx(
            "bg-gray-100 dark:bg-gray-900 rounded-lg shadow-lg p-5 w-[300px] h-[300px] flex flex-col items-center justify-between  transition-all duration-1000",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
          )}
        >
          <Link
            href="/"
            className="text-3xl font-bold bg-gradient-to-t from-violet-800 to-purple-700 dark:from-violet-600 dark:to-purple-500 inline-block text-transparent bg-clip-text pr-1 tracking-[-.1em]"
          >
            shcbot
          </Link>
          <h1 className="text-2xl text-center dark:text-white">
            Welcome back, <span className="font-bold">{user.name}</span>!
          </h1>
          <p className="text-center text-gray-500">
            You are logged in as {user.email}
          </p>
          <button
            onClick={logout}
            className="mt-6 px-6 py-2 rounded-md text-white bg-gradient-to-t from-violet-900 to-purple-600 hover:to-purple-500 shadow-sm hover:shadow-lg text-md transition duration-300"
          >
            Logout
          </button>
        </div>
      ) : (
        <Suspense fallback={<div>Loading form...</div>}>
          <AuthPageWrapper />
        </Suspense>
      )}
    </main>
  );
}
