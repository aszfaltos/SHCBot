"use client";

import DiagonalLayout from "@/components/ui/DiagonalLayout";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Home() {
  const { user, logout } = useAuth();
  return (
    <DiagonalLayout>
      {user ? (
        <>
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            Welcome back,{" "}
            <span className="bg-gradient-to-t from-violet-800 to-purple-700 dark:from-violet-600 dark:to-purple-500 inline-block text-transparent bg-clip-text pr-1 tracking-[-.1em]">
              {user.name}
            </span>
          </h1>
          <Link
            href="/chat"
            className="mt-6 px-6 py-2 bg-gradient-to-t from-violet-900 to-purple-600 hover:to-purple-500 shadow-sm hover:shadow-lg text-white rounded-lg font-semibold transition duration-300"
          >
            Start chatting
          </Link>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Not you?{" "}
            <button onClick={logout} className="text-purple-700 underline">
              Logout
            </button>
            .
          </p>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            Welcome to{" "}
            <span className="bg-gradient-to-t from-violet-800 to-purple-700 dark:from-violet-600 dark:to-purple-500 inline-block text-transparent bg-clip-text pr-1 tracking-[-.1em]">
              shcbot
            </span>
          </h1>
          <p className="mb-6 text-lg dark:text-gray-300">
            Your 24/7 university guide!
          </p>
          <Link
            href="/auth?mode=login"
            className="mt-6 px-6 py-2 bg-gradient-to-t from-violet-900 to-purple-600 hover:to-purple-500 shadow-sm hover:shadow-lg text-white rounded-lg font-semibold transition duration-300"
          >
            Log in
          </Link>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account? Create one{" "}
            <Link
              href="/auth?mode=register"
              className="text-purple-700 underline"
            >
              here
            </Link>
            .
          </p>
        </>
      )}
    </DiagonalLayout>
  );
}
