"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

export default function DiagonalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Top Gradient for small screens, Left for large */}
      <div
        className={clsx(
          "absolute w-full h-[50%] sm:w-[50%] sm:h-full bg-gradient-to-b from-violet-800 dark:from-violet-900 to-purple-700 dark:to-purple-900 transform transition-transform duration-1000",
          "top-[-30%] sm:top-0 sm:left-[-20%]",
          "skew-y-6 sm:skew-x-12 sm:skew-y-0",
          mounted
            ? "translate-y-0 sm:translate-x-0"
            : "-translate-y-full sm:translate-y-0 sm:-translate-x-full"
        )}
      />

      {/* Bottom Gradient for small screens, Right for large */}
      <div
        className={clsx(
          "absolute w-full h-[50%] sm:w-[50%] sm:h-full bg-gradient-to-b from-violet-800 dark:from-violet-900 to-purple-700 dark:to-purple-900 transform transition-transform duration-1000",
          "bottom-[-30%] sm:bottom-auto sm:top-0 sm:right-[-20%]",
          "skew-y-6 sm:skew-x-12 sm:skew-y-0",
          mounted
            ? "translate-y-0 sm:translate-x-0"
            : "translate-y-full sm:translate-y-0 sm:translate-x-full"
        )}
      />

      {/* Main Content */}
      <div
        className={clsx(
          "relative z-10 flex flex-col items-center justify-center h-full text-center px-4 transition-opacity duration-1500",
          mounted ? "opacity-100" : "opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}
