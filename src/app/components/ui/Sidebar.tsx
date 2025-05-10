import {
  History,
  LogIn,
  LogOut,
  Palette,
  Plus,
  Settings,
  UserPlus,
  UserRoundX,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatHistory } from "@/context/ChatHistoryContext";
import ThemeSelector from "./ThemeSelector";
import HistoryItem from "./HistoryItem";

interface SidebarProps {
  user: { name: string; email: string } | null;
  isOpen: boolean;
  onCreateChat: () => void;
  onSelectChat: (chatId: string) => void;
  onLogout: () => void;
}

const Sidebar = ({
  user,
  isOpen,
  onCreateChat,
  onSelectChat,
  onLogout,
}: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();

  const { history, refreshHistory } = useChatHistory();

  useEffect(() => {
    if (user) {
      refreshHistory();
    }
  }, [user]);

  const toggleProfileMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent closing sidemenu
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleAuth = () => {
    // Redirect to the registration/login page
    router.push("/auth");
  };

  const filteredHistory = history
    .map((item) => ({
      ...item,
      conversations: item.conversations.filter((conversation: any) =>
        conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((item) => item.conversations.length > 0);

  async function clearAllChats() {
    const confirmed = confirm("Are you sure you want to delete all chats?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/chat/clear", {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");

      alert(`Deleted ${data.count} chat(s).`);
      // Optionally reload or update UI
      refreshHistory();
      router.push("/chat");
    } catch (err) {
      console.error(err);
      alert("Failed to delete chats.");
    }
  }

  async function deleteAuth() {
    const confirmed = confirm("Are you sure you want to delete your account?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/auth", {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");

      alert("Account deleted successfully.");
      // Optionally redirect or update UI
      router.push("/auth");
    } catch (err) {
      console.error(err);
      alert("Failed to delete account.");
    }
  }

  return (
    <aside
      className={`bg-gray-100 dark:bg-gray-900 text-black dark:text-white w-80 transition-transform transform fixed top-16 bottom-0 left-0 z-30 flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* 🔍 Search Bar */}
      <div className="h-16 flex items-center p-4 gap-3">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value || "")}
          className="w-full px-4 py-2 rounded-full border-2 border-gray-300 dark:border-gray-800 focus:outline-none transition focus:border-gray-400 dark:focus:border-gray-500 focus:shadow-md"
        />
        <button
          className="rounded-full transition hover:bg-gray-200 dark:hover:bg-gray-800 p-2"
          title="Start a new chat"
          onClick={onCreateChat}
        >
          <Plus className="w-7 h-7 transition text-gray-400 dark:text-gray-500" />
        </button>
      </div>

      {/* 📜 Scrollable History */}
      <div className="flex-grow overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-700 active:scrollbar-thumb-gray-500 dark:active:scrollbar-thumb-gray-600">
        {filteredHistory.map((item) => (
          <div key={item.id} className="px-4 mb-4">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              {item.title}
            </h2>
            <ul className="space-y-1 mt-3">
              {item.conversations.map((conv: any, index: number) => (
                <HistoryItem
                  key={conv._id || `conv-${index}`}
                  onClick={() => {
                    onSelectChat(conv._id); // optional: still notify parent
                    router.push(`/chat/${conv._id}`);
                  }}
                  conversation={conv}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 👤 Profile at bottom */}
      <div className="mt-auto border-t border-gray-300 dark:border-gray-800 flex flex-col px-4 py-4">
        <div>
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-400 text-xl font-medium border-2 border-gray-200 dark:border-gray-700">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="font-semibold dark:text-white">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            {/* Three dots */}
            <button
              onClick={toggleProfileMenu}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            >
              <svg
                className="h-6 w-6 text-gray-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
              </svg>
            </button>
          </div>

          {/* Dropdown for logged in user */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isProfileMenuOpen ? "max-h-50 opacity-100" : "max-h-0 opacity-0"
            } flex flex-col space-y-2 mt-2`}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 dark:text-gray-300 transition text-sm font-medium group cursor-default">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                Theme
              </div>
              <ThemeSelector />
            </div>
            <button
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 dark:text-gray-300 transition text-sm font-medium cursor-default"
              onClick={clearAllChats}
            >
              <History className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              Clear History
            </button>
            <button
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 dark:text-gray-300 transition text-sm font-medium cursor-default"
              onClick={deleteAuth}
            >
              <UserRoundX className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              Delete Account
            </button>
            <button
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 dark:text-gray-300 focus:outline-none transition text-sm font-medium"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
