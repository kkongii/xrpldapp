"use client"

import { AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
      <p className="text-red-800 flex-1">{message}</p>
      {onDismiss && (
        <Button variant="ghost" size="sm" onClick={onDismiss} className="text-red-600 hover:text-red-800">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
