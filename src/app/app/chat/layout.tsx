"use client";

import Navbar from "@/components/ui/Navbar";
import Sidebar from "@/components/ui/Sidebar";
import React from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChatHistoryProvider } from "@/context/ChatHistoryContext";
import { useAuth } from "@/hooks/useAuth";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { user, isLoading, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleSelectChat = (chatId: string) => {
    setIsMenuOpen(false);
    router.push(`/chat/${chatId}`);
  };

  const handleNewChat = () => {
    setIsMenuOpen(false);
    router.push("/chat");
  };

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  //   console.log(document.cookie);

  return (
    <ChatHistoryProvider>
      <div className="h-screen overflow-hidden flex flex-col dark:bg-gray-950">
        {/* Navbar */}
        <Navbar
          className={clsx(
            "transition-all duration-1000",
            mounted ? "translate-y-0" : "-translate-y-full"
          )}
          isOpen={isMenuOpen}
          onClick={toggleMenu}
        />
        {/* Body */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar */}
          <Sidebar
            user={user}
            isOpen={isMenuOpen}
            onCreateChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onLogout={handleLogout}
          />

          {/* Content area */}
          <main className="flex-1 bg-gray-200 dark:bg-gray-950 overflow-hidden relative z-10">
            {user && children}
          </main>

          {/* Lighter Overlay */}
          <div
            className={`absolute inset-0 transition-opacity bg-black z-20 ${
              isMenuOpen
                ? "opacity-50 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
            onClick={toggleMenu}
          />
        </div>

        {!user && !isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">
                You are not logged in
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please log in to access the chat interface.
              </p>
              <button
                onClick={() => router.push("/auth")}
                className="px-6 py-2 rounded-md text-white bg-gradient-to-t from-violet-900 to-purple-600 hover:to-purple-500 shadow-sm hover:shadow-lg text-md transition duration-300 "
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </ChatHistoryProvider>
  );
};

export default ChatLayout;
