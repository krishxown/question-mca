import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MediaProvider } from "@/context/media-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AI Exam System",
  description: "Modern AI-powered examination platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <MediaProvider>
            <main className="min-h-screen bg-gray-50">{children}</main>
          </MediaProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
