import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ReactQueryProvider } from "@/lib/react-query"
import "./globals.css"

export const metadata: Metadata = {
  title: "EHR Dashboard - Healthcare Management System",
  description: "Professional Electronic Health Records dashboard for healthcare providers",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ReactQueryProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </ReactQueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
