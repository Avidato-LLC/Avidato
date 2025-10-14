"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Import the Next.js Image component for optimization
import { useSession } from "next-auth/react";

const PublicNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

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
          {/* === Left: Logo (Updated with vectorized SVGs) === */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Avidato Icon"
              width={32} // Sets the icon size (adjust as needed)
              height={32}
              priority // Helps load the logo faster on initial page load
            />
            <Image
              src="/name.svg"
              alt="Avidato"
              width={110} // Sets the logotype size (adjust as needed)
              height={26}
              priority
            />
          </Link>

          {/* === Center: Desktop Links === */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-gray-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* === Right: Auth Buttons & Hamburger === */}
          <div className="flex items-center space-x-4">
            {/* Desktop Auth Buttons */}
            {session ? (
              <Link
                href="/dashboard"
                className="hidden sm:inline-block px-4 py-2 text-sm font-semibold rounded-full border border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-block text-sm font-semibold hover:text-gray-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="hidden sm:inline-block px-4 py-2 text-sm font-semibold rounded-full border border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={toggleMenu}
              className="md:hidden flex h-8 w-8 flex-col justify-center items-center gap-1.5 focus:outline-none"
              aria-label="Toggle menu"
            >
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
                className="block px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-200" />
            {session ? (
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="block mt-2 px-3 py-2 rounded-full font-semibold border border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors text-center"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block mt-2 px-3 py-2 rounded-full font-semibold border border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;