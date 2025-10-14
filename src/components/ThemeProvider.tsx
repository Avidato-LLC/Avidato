// src/components/ThemeProvider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

/**
 * ThemeProvider component that wraps the application.
 * It uses the `next-themes` library to manage light/dark mode switching.
 * @param {ThemeProviderProps} props - The props for the component.
 * @returns {React.ReactNode} The provider wrapping the children.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class" // Use class-based theming (adds `class="dark"` to <html>)
      defaultTheme="system" // Allow system preference
      enableSystem={true} // Enable auto switching based on system preference
      disableTransitionOnChange // Prevents flashes of unstyled content on theme change
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}