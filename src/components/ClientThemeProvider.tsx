"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ClientThemeProvider({
  children,
}: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light" // ⬅️ Force light theme by default
      forcedTheme="light" // ⬅️ Hardcode theme to light (ignores system preference)
      enableSystem={false} // ⬅️ Disable auto switching
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}