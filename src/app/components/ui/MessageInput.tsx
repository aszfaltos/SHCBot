import React from "react";
import clsx from "clsx";
import { SendHorizontal } from "lucide-react";

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

const MessageInput = ({
  input,
  setInput,
  isLoading,
  handleSubmit,
  className,
}: MessageInputProps) => {
  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        "h-20 rounded-t-[40px] bg-gradient-to-t from-violet-800 to-purple-800 dark:from-violet-900 dark:to-purple-900 flex items-center gap-3 px-5 transition-transform duration-1000",
        className
      )}
    >
      <input
        className="flex-1 bg-gray-100/20 dark:bg-gray-100/15 p-2 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-gray-100/30 dark:focus:ring-gray-100/20 transition duration-200"
        placeholder="Ask a question..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
      />
      <button
        className="rounded-full transition hover:bg-gray-200/20 dark:hover:bg-gray-200/10 active:bg-gray-200/30 dark:active:bg-gray-200/15 p-2"
        title="Send message"
      >
        <SendHorizontal
          className={`h-6 w-6 ${
            isLoading
              ? "text-gray-300 dark:text-gray-500"
              : "text-white dark:text-gray-300"
          }`}
        />
      </button>
    </form>
  );
};

export default MessageInput;
