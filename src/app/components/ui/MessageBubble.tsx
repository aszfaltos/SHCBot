import type { Message } from "@/lib/types";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import React, { useState } from "react";
import clsx from "clsx";

const MessageBubble = ({ message }: { message: Message }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<
    "like" | "dislike" | null
  >(null);

  const handleReaction = (reaction: "like" | "dislike") => {
    setSelectedReaction(reaction === selectedReaction ? null : reaction); // Toggle reaction
  };

  return (
    <div className="relative flex flex-col items-start">
      <div
        className={clsx(
          "px-3 py-1 rounded-[20px] border-2 transition duration-200 ease-in-out z-20",
          message.role === "user"
            ? "bg-gradient-to-t from-violet-700 to-purple-700 text-white self-end rounded-br-none max-w-[80%]"
            : "text-gray-800 dark:text-gray-300 self-start rounded-bl-none max-w-[80%]",
          message.role === "assistant" && isHovered
            ? "border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-800"
            : "border-transparent bg-gray-300 dark:bg-gray-700"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <p>{message.content}</p>
      </div>

      {/* Like/Dislike Buttons */}
      {message.role !== "user" && (
        <div
          className={clsx(
            "pt-1 transition-all duration-200",
            isHovered
              ? "opacity-100 max-h-20"
              : "opacity-0 max-h-0 overflow-hidden"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={clsx(
              "flex gap-3 bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-[20px] rounded-tl-none pl-3 pr-3 py-2"
            )}
          >
            <button
              className={clsx(
                "flex items-center justify-center rounded-full transition",
                selectedReaction === "like"
                  ? "text-green-500 hover:text-green-400"
                  : "text-gray-400 hover:text-gray-500"
              )}
              title="Like"
              onClick={() => handleReaction("like")}
            >
              <ThumbsUp className="h-5 w-5" />
            </button>
            <button
              className={clsx(
                "flex items-center justify-center rounded-full transition",
                selectedReaction === "dislike"
                  ? "text-red-500 hover:text-red-400"
                  : "text-gray-400 hover:text-gray-500"
              )}
              title="Dislike"
              onClick={() => handleReaction("dislike")}
            >
              <ThumbsDown className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
