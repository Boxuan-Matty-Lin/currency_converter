"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * Wraps the application with a theme provider to manage light/dark themes.
 * Passes all received props to the underlying NextThemesProvider.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}