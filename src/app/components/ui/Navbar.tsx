"use client";
import React from "react";
import MenuButton from "./MenuButton";
import Link from "next/link";

interface NavbarProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

const Navbar = ({ isOpen, onClick, className }: NavbarProps) => {
  return (
    <nav
      className={`h-16 bg-gradient-to-t from-violet-800 to-purple-800 dark:from-violet-900 dark:to-purple-900 text-white flex items-center justify-center px-10 shadow-lg relative z-40 ${className}`}
    >
      <div className="absolute left-5">
        <MenuButton isOpen={isOpen} onClick={onClick} />
      </div>
      <Link href="/" className="text-3xl font-semibold tracking-[-.1em]">
        shcbot
      </Link>
    </nav>
  );
};

export default Navbar;
