"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AddContact } from "@/components/add-contact"
import { useApp } from "@/lib/context"

export default function AddContactPage() {
  const { state } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!state.wallet) {
      router.push("/")
    }
  }, [state.wallet, router])

  if (!state.wallet) return null

  return <AddContact />
}
