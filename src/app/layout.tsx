import "./globals.css";
import type { Metadata } from "next"; // Import the Metadata type for better type-checking
import { Inter } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// --- Updated Metadata Object ---
// We are adding the 'icons' and 'manifest' properties to your existing object.
export const metadata: Metadata = {
  title: "Avidato",
  description: "Your AI-powered teaching assistant.",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Light theme only for public pages (landing, login, signup)
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-white text-gray-900" suppressHydrationWarning>
        <AuthProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}