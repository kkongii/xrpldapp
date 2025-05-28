"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { RouteConfirmation } from "@/components/route-confirmation"
import { useApp } from "@/lib/context"

export default function RouteConfirmationPage() {
  const { state } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!state.wallet) {
      router.push("/")
    }
    if (!state.receiverAddress || !state.amountInput) {
      router.push("/select-receiver")
    }
    // Only show this page for cross-currency transactions
    if (state.selectedCurrency === "XRP" && state.targetCurrency === "XRP") {
      router.push("/confirm")
    }
  }, [state.wallet, state.receiverAddress, state.amountInput, state.selectedCurrency, state.targetCurrency, router])

  if (!state.wallet || !state.receiverAddress || !state.amountInput) return null
  if (state.selectedCurrency === "XRP" && state.targetCurrency === "XRP") return null

  return <RouteConfirmation />
}
