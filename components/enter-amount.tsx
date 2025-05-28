"use client"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useApp } from "@/lib/context"
import { convertCurrency, formatFiat, formatXRP } from "@/lib/utils"
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3AuthUser,
  useWeb3Auth
} from "@web3auth/modal/react";
import {getAccounts, getBalance, signMessage, signAndSendTransaction} from "@/lib/xrplRPC";


export function EnterAmount() {
  const { connect, isConnected, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { provider } = useWeb3Auth();

  const { state, dispatch } = useApp()
  const router = useRouter()

  const handleAmountChange = (value: string) => {
    dispatch({ type: "SET_AMOUNT_INPUT", payload: value })

    const numValue = Number.parseFloat(value) || 0
    if (state.selectedCurrency !== "XRP") {
      const xrpAmount = convertCurrency(numValue, state.selectedCurrency, "XRP", state.fiatRate)
      dispatch({ type: "SET_CONVERTED_XRP", payload: xrpAmount })
    } else {
      dispatch({ type: "SET_CONVERTED_XRP", payload: numValue })
    }
  }

  const handleCurrencyChange = (currency: "XRP" | "USD" | "KRW") => {
    dispatch({ type: "SET_SELECTED_CURRENCY", payload: currency })

    if (state.amountInput) {
      const numValue = Number.parseFloat(state.amountInput) || 0
      if (currency !== "XRP") {
        const xrpAmount = convertCurrency(numValue, currency, "XRP", state.fiatRate)
        dispatch({ type: "SET_CONVERTED_XRP", payload: xrpAmount })
      } else {
        dispatch({ type: "SET_CONVERTED_XRP", payload: numValue })
      }
    }
  }

  const handleTargetCurrencyChange = (currency: "XRP" | "USD" | "KRW") => {
    dispatch({ type: "SET_TARGET_CURRENCY", payload: currency })
  }

  const isValidAmount = () => {
    const numValue = Number.parseFloat(state.amountInput) || 0
    return (
      numValue > 0 &&
      (state.selectedCurrency === "XRP" ? numValue <= state.balance : state.convertedXrp <= state.balance)
    )
  }

  const getConversionDisplay = () => {
    if (state.selectedCurrency !== "XRP" && state.amountInput) {
      return `≈ ${formatXRP(state.convertedXrp)} XRP`
    }
    if (state.selectedCurrency === "XRP" && state.amountInput) {
      const fiatValue = convertCurrency(Number.parseFloat(state.amountInput), "XRP", "USD", state.fiatRate)
      return `≈ ${formatFiat(fiatValue)}`
    }
    return ""
  }

  const handleNext = () => {
    // Check if this is a cross-currency transaction
    if (state.selectedCurrency !== "XRP" || state.targetCurrency !== "XRP") {
      // 크로스 커런시 
      const result = () => {
        try {
          if(!provider || state.receiverAddress) {
            return Error
          }
          //signAndSendTransaction(provider, Number(state.amountInput), state.receiverAddress)
          console.log("sign and send transaction arguments:" provider, state.amountInput, state.receiverAddress)
        } catch (error) {
          console.log(error)
        }
      } 
    } else {
      // Go directly to confirmation for XRP-to-XRP transactions
      router.push("/confirm")
    }
  }//send버튼눌렀을때돌아가는로직

  const isCrossCurrency = state.selectedCurrency !== "XRP" || state.targetCurrency !== "XRP"

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Enter Amount</h1>
          <p className="text-sm text-gray-500">How much would you like to send?</p>
        </div>
      </header>

      <div className="p-4 space-y-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  You send
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={state.amountInput}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="flex-1 h-12 text-xl font-medium border-gray-200"
                  />      //여기서 보낼 값을 받는다.
                  <Select value={state.selectedCurrency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger className="w-24 h-12 border-gray-200 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XRP">XRP</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="KRW">KRW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {getConversionDisplay() && <p className="text-sm text-gray-500">{getConversionDisplay()}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">They receive</Label>
                <Select value={state.targetCurrency} onValueChange={handleTargetCurrencyChange}>
                  <SelectTrigger className="h-12 border-gray-200 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XRP">XRP</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="KRW">KRW</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cross-currency indicator */}
              {isCrossCurrency && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 font-medium text-sm">Cross-Currency Payment</p>
                  <p className="text-blue-700 text-xs mt-1">
                    XRPL will automatically find the best exchange rate for {state.selectedCurrency} →{" "}
                    {state.targetCurrency}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium text-sm">Platform Fee: 0%</p>
          <p className="text-blue-700 text-xs mt-1">No platform fee – network fee only</p>
        </div>

        {state.amountInput && !isValidAmount() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium text-sm">Insufficient balance</p>
            <p className="text-red-700 text-xs">Available: {formatXRP(state.balance)} XRP</p>
          </div>
        )}

        <Button
          onClick={handleNext}
          disabled={!isValidAmount()}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          {isCrossCurrency ? "Find Best Route" : "Continue"}
        </Button>
      </div>
    </div>
  )
}
