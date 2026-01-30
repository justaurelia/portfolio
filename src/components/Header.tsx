"use client";

import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="pl-4 pr-2 py-4 bg-inkBlack/80 border-b border-porcelain/15 flex items-center justify-between text-lg backdrop-blur-sm">
      <Link to="/" className="flex items-center gap-2 no-underline text-porcelain hover:text-powderBlue focus-visible:ring-2 focus-visible:ring-powderBlue focus-visible:ring-offset-2 focus-visible:ring-offset-inkBlack rounded">
        <span className="font-bold text-xl text-porcelain">Aurélia Azarmi</span>
        <span className="text-sm text-porcelain/70 font-medium hidden sm:inline">
          Product Manager & AI SaaS Founder
        </span>
      </Link>
      <img
        src="/profile.jpg"
        alt="Aurélia Azarmi"
        className="h-20 w-auto shrink-0 rounded-lg object-cover border border-porcelain/20 -my-1"
      />
    </header>
  );
}
