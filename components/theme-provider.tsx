"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light"

type ThemeProviderContextType = {
  theme: Theme
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    setTheme("light") // Always enforce light theme
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem("hvox-theme", theme) // Still store for consistency, but it will always be 'light'
  }, [theme])

  return (
    <ThemeProviderContext.Provider value={{ theme }}>{children}</ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
