"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/lib/types";
import MessageBubble from "@/components/ui/MessageBubble";
import MessageInput from "@/components/ui/MessageInput";
import clsx from "clsx";
import { useChatHistory } from "@/context/ChatHistoryContext";

export default function ChatInterface() {
  const router = useRouter();
  const params = useParams();
  const chatId = params?.id as string | undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { refreshHistory } = useChatHistory();

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Fetch messages if chatId exists
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);

      if (!chatId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/chat/${chatId}`, {
          credentials: "include",
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await res.json();
        setMessages(data.content); // assuming `content` is the array of messages
      } catch (err) {
        console.error("Error loading messages:", err);
        router.push("/chat");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [chatId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setInput("");

    try {
      let currentChatId = chatId;

      // If it's a new chat, create it
      if (!chatId) {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            content: [],
            title: userMessage.content.substring(0, 50) || "New Chat",
          }),
        });

        if (!res.ok) throw new Error("Failed to create chat");

        const data = await res.json();
        currentChatId = data.insertedId;
        router.replace(`/chat/${currentChatId}`);
      }
      const updatedMessages = [...messages, userMessage];

      if (chatId) {
        // Optimistically add user message
        setMessages(updatedMessages);
      }

      // Send only the new message
      const res2 = await fetch(`/api/chat/${currentChatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: updatedMessages }),
      });

      if (!res2.ok) throw new Error("Failed to update chat");

      const data = await res2.json();

      // Append the new bot message to existing messages
      const lastMessage = data.updatedContent.slice(-1)[0];
      setMessages((prev) => [...prev, lastMessage]);
      refreshHistory();
    } catch (err) {
      console.error("Message send error:", err);
    }
  };

  return (
    <div
      className={clsx(
        "w-full sm:w-4/5 md:w-7/10 lg:w-5/8 xl:w-5/9 max-w-[1000px] bg-gray-100 dark:bg-gray-900 h-full mx-auto flex flex-col"
      )}
    >
      <div className="flex-1 overflow-auto scrollbar scrollbar-thumb-purple-700 dark:scrollbar-thumb-purple-900 scrollbar-track-gray-100">
        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Loading...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Send a message to start the conversation</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4 bottom-0">
            {messages.map((message) => (
              <MessageBubble message={message} key={message.id} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <MessageInput
        handleSubmit={handleSubmit}
        setInput={setInput}
        isLoading={isLoading}
        input={input}
      />
    </div>
  );
}
