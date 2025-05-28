"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Send, History, Copy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useApp } from "@/lib/context"
import { truncateAddress, formatXRP, formatFiat, fetchExchangeRates } from "@/lib/utils"
import { xrplService } from "@/lib/xrpl-service"
import { useToast } from "@/hooks/use-toast"

export function BalanceScreen() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Fetch real-time exchange rates
    fetchExchangeRates().then((rates) => {
      dispatch({ type: "SET_FIAT_RATE", payload: rates.xrpToUsd })
    })
  }, [dispatch])

  const handleLogout = async () => {
    await xrplService.disconnect()
    dispatch({ type: "LOGOUT" })
    router.push("/")
  }

  const handleRefreshBalance = async () => {
    if (!state.wallet?.address) return

    dispatch({ type: "SET_LOADING_BALANCE", payload: true })

    try {
      const balance = await xrplService.getAccountBalance(state.wallet.address)
      dispatch({ type: "SET_BALANCE", payload: balance })

      toast({
        title: "Balance updated",
        description: `Current balance: ${formatXRP(balance)} XRP`,
      })
    } catch (error) {
      toast({
        title: "Failed to refresh balance",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      dispatch({ type: "SET_LOADING_BALANCE", payload: false })
    }
  }

  const handleCopyAddress = () => {
    if (state.wallet?.address) {
      navigator.clipboard.writeText(state.wallet.address)
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const fiatValue = state.balance * state.fiatRate
  const networkInfo = xrplService.getNetworkInfo()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-700 font-medium text-sm">W</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{truncateAddress(state.wallet?.address || "")}</span>
              <Button variant="ghost" size="sm" onClick={handleCopyAddress} className="h-6 w-6 p-0">
                <Copy className="h-3 w-3 text-gray-500" />
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <div
                className={`h-1.5 w-1.5 rounded-full ${networkInfo.isConnected ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <span className="text-xs text-gray-500">{networkInfo.isTestnet ? "Testnet" : "Mainnet"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshBalance}
            disabled={state.isLoadingBalance}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 ${state.isLoadingBalance ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 w-8 p-0">
            <LogOut className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Balance Card */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="space-y-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{formatXRP(state.balance)} XRP</h1>
                <p className="text-gray-500 mt-1">{formatFiat(fiatValue)} USD</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-blue-700 text-sm font-medium">Platform fee: 0%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => router.push("/select-receiver")}
            className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <Send className="mr-2 h-5 w-5" />
            Send
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/history")}
            className="h-14 border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
          >
            <History className="mr-2 h-5 w-5" />
            History
          </Button>
        </div>
      </div>
    </div>
  )
}
