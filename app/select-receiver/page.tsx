"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SelectReceiver } from "@/components/select-receiver"
import { useApp } from "@/lib/context"

export default function SelectReceiverPage() {
  const { state } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!state.wallet) {
      router.push("/")
    }
  }, [state.wallet, router])

  if (!state.wallet) return null

  return <SelectReceiver />
}
