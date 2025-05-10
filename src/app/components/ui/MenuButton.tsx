interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function MenuButton({ isOpen, onClick }: MenuButtonProps) {
  return (
    <button
      className="relative flex flex-col justify-center items-start group transition duration-200 bg-transparent p-2 rounded-md hover:bg-white/10 active:bg-white/20"
      onClick={onClick}
    >
      <span
        className={`block h-1 w-6 bg-white transition-transform duration-300 ease-in-out ${
          isOpen ? "rotate-45 translate-y-2" : ""
        }`}
      />
      <span
        className={`block h-1 w-6 bg-white mt-1 transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-0" : ""
        }`}
      />
      <span
        className={`block h-1 w-4 bg-white mt-1 transition-transform duration-300 ease-in-out ${
          isOpen ? "-rotate-45 -translate-y-2 w-6" : ""
        }`}
      />
    </button>
  );
}
