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
    // Set base text color to black for the entire header
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border text-black">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* === Left: Logo === */}
          <Link href="/" className="flex items-center gap-2">
            {/* Changed icon color to black */}
            <AppIcon className="w-8 h-8 text-black" />
            <span className="text-xl font-bold">Avidato</span>
          </Link>

          {/* === Center: Desktop Links === */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                // Changed hover to a subtle gray for contrast
                className="hover:text-gray-600 transition-colors"
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
              className="hidden sm:inline-block text-sm font-semibold hover:text-gray-600 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              // Updated to an outline button style
              className="hidden sm:inline-block px-4 py-2 text-sm font-semibold rounded-full border border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors"
            >
              Sign Up
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={toggleMenu}
              className="md:hidden flex h-8 w-8 flex-col justify-center items-center gap-1.5 focus:outline-none"
              aria-label="Toggle menu"
            >
              {/* Changed hamburger bars to black */}
              <span
                className={`block w-5 h-0.5 bg-black transition-transform duration-300 ease-in-out ${
                  isMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-black transition-opacity duration-300 ease-in-out ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-black transition-transform duration-300 ease-in-out ${
                  isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* === Mobile Dropdown Menu === */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border shadow-xl">
          <nav className="flex flex-col px-4 py-4 space-y-2 text-sm">
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
              // Matched mobile Sign Up button to new outline style
              className="block mt-2 px-3 py-2 rounded-full font-semibold border border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors text-center"
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