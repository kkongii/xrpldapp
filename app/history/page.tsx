"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { TransactionHistory } from "@/components/transaction-history"
import { useApp } from "@/lib/context"

export default function HistoryPage() {
  const { state } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!state.wallet) {
      router.push("/")
    }
  }, [state.wallet, router])

  if (!state.wallet) return null

  return <TransactionHistory />
}
