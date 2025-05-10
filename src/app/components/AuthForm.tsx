"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Correct hook for App Directory
import clsx from "clsx";

const AuthForm = ({
  initialMode = "login",
}: {
  initialMode?: "login" | "register";
}) => {
  const [isLogin, setLogin] = useState(initialMode === "login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMode = () => {
    router.replace(`/auth?mode=${isLogin ? "register" : "login"}`);
    setLogin((prev) => !prev);
    setMessage(""); // Clear message when toggling
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = "/api/auth";
    const payload = {
      mode: isLogin ? "login" : "register",
      email,
      password,
      username,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        if (isLogin) {
          // Store the token from the response
          if (data.token) {
            localStorage.setItem("token", data.token);
            // Also store user info if available
            if (data.user) {
              localStorage.setItem("user", JSON.stringify(data.user));
            }
          }
          router.push("/chat"); // Redirect on successful login
        } else {
          setLogin(true); // Switch to login mode after registration
        }
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div
      className={clsx(
        "bg-gray-100 dark:bg-gray-900 rounded-lg shadow-lg p-5 w-[300px] h-[300px] flex flex-col items-center justify-between  transition-all duration-1000",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
      )}
    >
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col items-center justify-between gap-2"
      >
        <a
          href="/"
          className="text-3xl font-bold bg-gradient-to-t from-violet-800 to-purple-700 dark:from-violet-600 dark:to-purple-500 inline-block text-transparent bg-clip-text pr-1 tracking-[-.1em]"
        >
          shcbot
        </a>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 w-full">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-100 dark:bg-gray-700 rounded-md p-1 border-2 border-gray-300 dark:border-gray-800 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-700 transition duration-200 ease-in-out placeholder:text-gray-400 placeholder:text-sm"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-100 dark:bg-gray-700 rounded-md p-1 border-2 border-gray-300 dark:border-gray-800 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-700 transition duration-200 ease-in-out placeholder:text-gray-400 placeholder:text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-100 dark:bg-gray-700 rounded-md p-1 border-2 border-gray-300 dark:border-gray-800 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-700 transition duration-200 ease-in-out placeholder:text-gray-400 placeholder:text-sm"
          />
          {/*Need additional changing*/}
          {message && <p className="text-red-500 text-sm">{message}</p>}{" "}
        </div>
        <button
          type="submit"
          className="mt-6 px-6 py-2 rounded-md text-white bg-gradient-to-t from-violet-900 to-purple-600 hover:to-purple-500 shadow-sm hover:shadow-lg text-md transition duration-300"
        >
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-400">
        {isLogin ? "Need an account? " : "Already have an account? "}
        <button onClick={toggleMode} className="underline text-blue-500">
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
