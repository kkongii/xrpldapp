"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ErrorBanner } from "@/components/ui/error-banner"
import { useApp } from "@/lib/context"
import { truncateAddress, formatXRP, formatFiat, convertCurrency } from "@/lib/utils"
import { xrplService } from "@/lib/xrpl-service"
import { useToast } from "@/hooks/use-toast"

export function ConfirmTransaction() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const { toast } = useToast()

  const amount = Number.parseFloat(state.amountInput) || 0
  const selectedPath = state.crossCurrency.selectedPath

  const xrpAmount = selectedPath
    ? Number.parseFloat(selectedPath.sourceAmount)
    : state.selectedCurrency === "XRP"
      ? amount
      : state.convertedXrp

  const receivedAmount = selectedPath
    ? Number.parseFloat(selectedPath.destinationAmount)
    : state.targetCurrency === "XRP"
      ? xrpAmount
      : convertCurrency(xrpAmount, "XRP", state.targetCurrency, state.fiatRate)

  const networkFee = selectedPath ? selectedPath.networkFee : 0.000012
  const platformFee = 0

  const handleSubmit = async () => {
    dispatch({ type: "SET_SUBMITTING", payload: true })
    dispatch({ type: "SET_TX_ERROR", payload: null })

    try {
      const result = await xrplService.submitPayment(
        state.wallet!.address,
        state.receiverAddress!,
        receivedAmount.toString(),
        state.targetCurrency,
        selectedPath?.paths,
        xrpAmount.toString(),
      )

      console.log("Transaction result:", result)

      const transaction = {
        id: Date.now().toString(),
        hash: result.result?.tx_json?.hash || `${Date.now().toString(16).toUpperCase()}`,
        type: "sent" as const,
        amount: xrpAmount,
        currency: "XRP",
        destination: state.receiverAddress!,
        source: state.wallet!.address,
        timestamp: new Date(),
        fee: networkFee,
        status: "success" as const,
        receivedAmount,
        receivedCurrency: state.targetCurrency,
        platformFee,
      }

      dispatch({ type: "ADD_TRANSACTION", payload: transaction })
      dispatch({ type: "SET_BALANCE", payload: state.balance - xrpAmount - networkFee })

      toast({
        title: "Transaction Successful",
        description: `Sent ${formatXRP(xrpAmount)} XRP → ${
          state.targetCurrency === "XRP"
            ? `${formatXRP(receivedAmount)} XRP`
            : `${formatFiat(receivedAmount)} ${state.targetCurrency}`
        }`,
      })

      router.push("/history")
    } catch (error: any) {
      console.error("Transaction error:", error)
      dispatch({ type: "SET_TX_ERROR", payload: error.message || "Transaction failed. Please try again." })
    } finally {
      dispatch({ type: "SET_SUBMITTING", payload: false })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Confirm Transaction</h1>
          <p className="text-sm text-gray-500">Review your transaction details</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {state.txError && (
          <ErrorBanner message={state.txError} onDismiss={() => dispatch({ type: "SET_TX_ERROR", payload: null })} />
        )}

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg font-bold text-gray-900">Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-red-700 text-sm font-medium mb-1">You Send</p>
                <p className="text-2xl font-bold text-red-800">{formatXRP(xrpAmount)} XRP</p>
                <p className="text-red-600 text-sm">From: {truncateAddress(state.wallet?.address || "")}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-green-700 text-sm font-medium mb-1">They Receive</p>
                <p className="text-2xl font-bold text-green-800">
                  {state.targetCurrency === "XRP"
                    ? `${formatXRP(receivedAmount)} XRP`
                    : `${formatFiat(receivedAmount)} ${state.targetCurrency}`}
                </p>
                <p className="text-green-600 text-sm">To: {truncateAddress(state.receiverAddress || "")}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-gray-900 text-sm">Fee Breakdown</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee:</span>
                  <span className="font-medium text-blue-600">0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network Fee:</span>
                  <span className="font-medium">{formatXRP(networkFee)} XRP</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between font-medium">
                  <span>Total Cost:</span>
                  <span>{formatXRP(xrpAmount + networkFee)} XRP</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium text-sm">Demo Transaction</p>
                <p className="text-blue-700 text-xs">This is a simulated transaction for demonstration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={state.isSubmitting}
            className="h-12 border-gray-200 text-gray-700 font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={state.isSubmitting}
            className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {state.isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Sending...
              </>
            ) : (
              "Send Now"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
