"use client";

import React, { useState } from "react";
import Link from "next/link";

// --- Brand Icon ---
const AppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
    />
  </svg>
);

const PublicNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const links = [
    { href: "/#features", label: "Features" },
    { href: "/#pedagogy", label: "Pedagogy" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#faq", label: "FAQ" },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border text-foreground">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* === Left: Logo === */}
          <Link href="/" className="flex items-center gap-2">
            <AppIcon className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Avidato</span>
          </Link>

          {/* === Center: Desktop Links === */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* === Right: Auth Buttons & Hamburger === */}
          <div className="flex items-center space-x-4">
            {/* Desktop Auth Buttons */}
            <Link
              href="/login"
              className="hidden sm:inline text-sm font-semibold hover:text-primary transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="hidden sm:inline px-4 py-2 text-sm font-semibold rounded-full text-white bg-primary hover:opacity-90 transition-colors"
            >
              Sign Up
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={toggleMenu}
              className="md:hidden flex flex-col justify-center items-center space-y-1 focus:outline-none"
              aria-label="Toggle menu"
            >
              <span
                className={`block w-5 h-0.5 bg-foreground transition-transform ${
                  isMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-foreground transition-opacity ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-foreground transition-transform ${
                  isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* === Mobile Dropdown Menu === */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border shadow-xl">
          <nav className="flex flex-col px-4 py-3 space-y-2 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-md hover:bg-secondary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-medium hover:bg-secondary transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-semibold text-white bg-primary text-center hover:opacity-90 transition-colors"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;