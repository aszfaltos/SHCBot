import React, { createContext, useCallback, useContext, useState } from "react";

interface ChatHistoryContextType {
  history: any[];
  refreshHistory: () => Promise<void>;
}

function groupHistoryByDate(history: any[]) {
  const now = new Date();

  const groupedHistory: any[] = [
    { id: 1, title: "Today", conversations: [], diff: 1 },
    { id: 2, title: "Yesterday", conversations: [], diff: 2 },
    { id: 3, title: "This week", conversations: [], diff: 7 },
    { id: 4, title: "Two weeks ago", conversations: [], diff: 14 },
    { id: 5, title: "This month", conversations: [], diff: 30 },
    { id: 6, title: "Older", conversations: [] },
  ];

  history.sort((a, b) => {
    const dateA = new Date(a.updatedAt);
    const dateB = new Date(b.updatedAt);
    return dateB.getTime() - dateA.getTime();
  });

  history.forEach((item) => {
    const updatedDate = new Date(item.updatedAt);
    const diffTime = now.getTime() - updatedDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    // Insert into groupedHistory based on diffDays
    const group = groupedHistory.find((group) => {
      if (group.diff) {
        return diffDays <= group.diff;
      }
      return true; // For "Older" group
    });
    if (group) {
      group.conversations.push(item);
    }
  });

  const format = (arr: any[]) =>
    arr.map((item) => ({ title: item.title, _id: item._id }));

  return groupedHistory
    .map((group) => ({
      ...group,
      conversations: format(group.conversations),
    }))
    .filter((group) => group.conversations.length > 0);
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(
  undefined
);

export const ChatHistoryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [history, setHistory] = useState<any[]>([]);

  const refreshHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/chat", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const chats = await res.json();
      const grouped = groupHistoryByDate(chats);
      setHistory(grouped);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, []);

  return (
    <ChatHistoryContext.Provider value={{ history, refreshHistory }}>
      {children}
    </ChatHistoryContext.Provider>
  );
};

export const useChatHistory = () => {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error("useChatHistory must be used within a ChatHistoryProvider");
  }
  return context;
};
