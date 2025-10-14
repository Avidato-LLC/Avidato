// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import ClientThemeProvider from "@/components/ClientThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Avidato",
  description: "Your AI-powered teaching assistant.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {/* client-only provider avoids SSR/client mismatch */}
        <ClientThemeProvider>
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
        </ClientThemeProvider>
      </body>
    </html>
  );
}