"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { EnterAmount } from "@/components/enter-amount"
import { useApp } from "@/lib/context"

export default function EnterAmountPage() {
  const { state } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!state.wallet) {
      router.push("/")
    }
    if (!state.receiverAddress) {
      router.push("/select-receiver")
    }
  }, [state.wallet, state.receiverAddress, router])

  if (!state.wallet || !state.receiverAddress) return null

  return <EnterAmount />
}
