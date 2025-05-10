import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

export default function HistoryItem({
  conversation,
  onClick,
}: {
  conversation: { title: string };
  onClick: () => void;
}) {
  const containerRef = useRef<HTMLLIElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (container && content) {
      setShouldScroll(content.scrollWidth > container.clientWidth);
    }
  }, [conversation.title]);

  return (
    <li
      ref={containerRef}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 font-medium transition duration-300 cursor-pointer overflow-hidden relative group"
      onClick={onClick}
    >
      <div className="relative whitespace-nowrap w-fit">
        <div
          ref={contentRef}
          className={clsx(
            "flex gap-8",
            shouldScroll ? "group-hover:animate-marquee-left" : ""
          )}
        >
          <span className="block">{conversation.title}</span>
          {shouldScroll && <span className="block">{conversation.title}</span>}
        </div>
      </div>
      {/* Gradient overlay on right */}
      {shouldScroll && (
        <>
          <div className="invisible group-hover:visible pointer-events-none absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-gray-100 group-hover:from-gray-200 dark:from-gray-900 dark:group-hover:from-gray-800 to-transparent transition duration-300" />
          <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-gray-100 group-hover:from-gray-200 dark:from-gray-900 dark:group-hover:from-gray-800 to-transparent transition duration-300" />
        </>
      )}
    </li>
  );
}
