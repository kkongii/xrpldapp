"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { BalanceScreen } from "@/components/balance-screen"
import { useApp } from "@/lib/context"

export default function BalancePage() {
  const { state } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!state.wallet) {
      router.push("/")
    }
  }, [state.wallet, router])

  if (!state.wallet) return null

  return <BalanceScreen />
}
