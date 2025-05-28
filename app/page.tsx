"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { WalletConnect } from "@/components/wallet-connect"
import { useApp } from "@/lib/context"

export default function HomePage() {
  const { state } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (state.wallet) {
      router.push("/balance")
    }
  }, [state.wallet, router])

  return <WalletConnect />
}
