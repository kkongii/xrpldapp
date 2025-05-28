import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { AppProvider } from "@/lib/context"
import { Toaster } from "@/components/ui/toaster"
import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from "@/lib/web3auth";


export const metadata: Metadata = {
  title: "XRPL Wallet",
  description: "A modern XRPL wallet application",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body >
        <Web3AuthProvider config={web3AuthContextConfig}>
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
        </Web3AuthProvider>
      </body>
    </html>
  )
}
