"use client";

import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/work", label: "Work" },
  ];

  return (
    <nav className="p-4 bg-white border-b border-border flex justify-between items-center relative text-lg">
      <Link to="/" className="font-bold text-xl">
        Aurelia Azarmi
      </Link>

      <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={`${
              pathname === link.href ? "text-primary font-semibold" : "text-gray-600"
            } hover:text-primary transition`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
