"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ConfirmTransaction } from "@/components/confirm-transaction"
import { useApp } from "@/lib/context"

export default function ConfirmPage() {
  const { state } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!state.wallet) {
      router.push("/")
    }
    if (!state.receiverAddress || !state.amountInput) {
      router.push("/select-receiver")
    }
  }, [state.wallet, state.receiverAddress, state.amountInput, router])

  if (!state.wallet || !state.receiverAddress || !state.amountInput) return null

  return <ConfirmTransaction />
}
