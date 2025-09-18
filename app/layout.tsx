import type React from "react"
import type { Metadata } from "next"
import { Instrument_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/next"

const instrument_sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "HVOX - Ultimate AI Voice Agent",
  description: "Join the future of voice AI with HVOX",
  generator: 'v0.app',
  icons: {
    icon: '/hynox_logo.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${instrument_sans.variable} antialiased dark`}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
