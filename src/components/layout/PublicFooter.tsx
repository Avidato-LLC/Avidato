"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import the Next.js Image component

// --- SVG Icons used in the Footer ---
// These are fine as they are.
const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>;
const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>;
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664 4.771 4.919 4.919 1.266-.057 1.644-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.059 1.689.073 4.948.073s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z" /></svg>;

// --- Helper Component for Footer Links (Updated Style) ---
const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-gray-400 transition-colors hover:text-white">
    {children}
  </Link>
);

// --- Main Footer Component ---
export default function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Column 1: Logo, Mission, and Socials */}
          <div className="col-span-1 md:col-span-5">
            <div className="flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/white-logo.svg"
                  alt="Avidato Icon"
                  width={32}
                  height={32}
                />
                <Image
                  src="/white-name.svg"
                  alt="Avidato"
                  width={110}
                  height={26}
                />
              </Link>
              <p className="max-w-sm text-sm text-gray-400">
                Empowering tutors with AI-powered tools to create impactful, pedagogically-sound lessons faster than ever before.
              </p>
              <div className="flex space-x-4">
                <a href="#" target="_blank" className="text-gray-400 transition-colors hover:text-white"><TwitterIcon className="h-5 w-5" /></a>
                <a href="#" target="_blank" className="text-gray-400 transition-colors hover:text-white"><LinkedInIcon className="h-5 w-5" /></a>
                <a href="#" target="_blank" className="text-gray-400 transition-colors hover:text-white"><InstagramIcon className="h-5 w-5" /></a>
              </div>
            </div>
          </div>

          {/* Spacer for alignment */}
          <div className="hidden md:block md:col-span-1"></div>

          {/* Column 2: Quick Links */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <div className="flex flex-col space-y-3 text-sm">
              <FooterLink href="/#features">Features</FooterLink>
              <FooterLink href="/#pedagogy">Pedagogy</FooterLink>
              <FooterLink href="/#pricing">Pricing</FooterLink>
              <FooterLink href="/#faq">FAQ</FooterLink>
            </div>
          </div>

          {/* Column 3: Legal */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <div className="flex flex-col space-y-3 text-sm">
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
            </div>
          </div>

          {/* Column 4: Get Started */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-semibold text-white mb-4">Get Started</h3>
            <div className="flex flex-col space-y-3 text-sm">
              <FooterLink href="/login">Log In</FooterLink>
              <FooterLink href="/signup">Create an Account</FooterLink>
            </div>
          </div>
        </div>

        <hr className="my-10 border-gray-800" />

        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Avidato AI. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}