"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Zap, TrendingUp, Clock, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { ErrorBanner } from "@/components/ui/error-banner"
import { useApp } from "@/lib/context"
import { findCurrencyPaths, calculateEffectiveRate, formatRate, formatXRP, formatFiat } from "@/lib/utils"
import { xrplService } from "@/lib/xrpl-service"
import type { PathOption } from "@/lib/types"
import { validateXRPAddress } from "@/lib/utils"

export function PathSelection() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  useEffect(() => {
    if (state.selectedCurrency !== "XRP" && state.targetCurrency !== "XRP") {
      loadPaths()
    }
  }, [state.amountInput, state.selectedCurrency, state.targetCurrency])

  const loadPaths = async () => {
    if (!state.wallet?.address || !state.receiverAddress || !state.amountInput) {
      console.log("Missing required data for path finding")
      return
    }

    // Validate addresses before proceeding
    if (!validateXRPAddress(state.wallet.address)) {
      console.log("Invalid wallet address:", state.wallet.address)
      dispatch({
        type: "SET_PATH_ERROR",
        payload: "Invalid wallet address. Please reconnect your wallet.",
      })
      return
    }

    if (!validateXRPAddress(state.receiverAddress)) {
      console.log("Invalid receiver address:", state.receiverAddress)
      dispatch({
        type: "SET_PATH_ERROR",
        payload: "Invalid receiver address. Please select a valid recipient.",
      })
      return
    }

    dispatch({ type: "SET_LOADING_PATHS", payload: true })
    dispatch({ type: "SET_PATH_ERROR", payload: null })
    setIsUsingMockData(false)

    try {
      console.log("Loading currency paths with validated addresses...")

      const paths = await findCurrencyPaths(
        state.wallet.address,
        state.receiverAddress,
        state.amountInput,
        state.targetCurrency,
      )

      console.log("Loaded paths:", paths)

      // Check if we're using mock data
      const isMock = paths.some((path) => path.id.includes("mock") || path.id.includes("enhanced_mock"))
      setIsUsingMockData(isMock)

      dispatch({ type: "SET_AVAILABLE_PATHS", payload: paths })

      // Auto-select best rate (first in sorted array)
      if (paths.length > 0) {
        dispatch({ type: "SET_SELECTED_PATH", payload: paths[0] })
      }
    } catch (error: any) {
      console.error("Path loading error:", error)
      setIsUsingMockData(true)
      dispatch({
        type: "SET_PATH_ERROR",
        payload: "Using demo data - unable to connect to XRPL network",
      })

      // Load mock data as fallback
      try {
        const mockPaths = await findCurrencyPaths(
          state.wallet.address,
          state.receiverAddress,
          state.amountInput,
          state.targetCurrency,
        )
        dispatch({ type: "SET_AVAILABLE_PATHS", payload: mockPaths })
        if (mockPaths.length > 0) {
          dispatch({ type: "SET_SELECTED_PATH", payload: mockPaths[0] })
        }
      } catch (mockError) {
        console.error("Failed to load mock data:", mockError)
      }
    } finally {
      dispatch({ type: "SET_LOADING_PATHS", payload: false })
    }
  }

  const handleSelectPath = (path: PathOption) => {
    dispatch({ type: "SET_SELECTED_PATH", payload: path })
  }

  const handleContinue = () => {
    router.push("/confirm")
  }

  const handleRetry = () => {
    loadPaths()
  }

  const getPathIcon = (index: number) => {
    if (index === 0) return <Zap className="h-4 w-4 text-blue-600" />
    if (index === 1) return <TrendingUp className="h-4 w-4 text-green-600" />
    return <Clock className="h-4 w-4 text-orange-600" />
  }

  const getPathLabel = (index: number) => {
    if (index === 0) return "Best Rate"
    if (index === 1) return "Fast"
    return "Stable"
  }

  const networkInfo = xrplService.getNetworkInfo()

  if (state.selectedCurrency === "XRP" || state.targetCurrency === "XRP") {
    router.push("/confirm")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">Choose Route</h1>
          <p className="text-sm text-gray-500">Select the best path for your transaction</p>
        </div>
        <div className="flex items-center gap-2">
          {networkInfo.isConnected ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {isUsingMockData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3">
            <WifiOff className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-yellow-800 font-medium text-sm">Demo Mode</p>
              <p className="text-yellow-700 text-xs">Using simulated data</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRetry} className="text-yellow-700 border-yellow-300">
              Retry
            </Button>
          </div>
        )}

        {state.crossCurrency.pathError && (
          <ErrorBanner
            message={state.crossCurrency.pathError}
            onDismiss={() => dispatch({ type: "SET_PATH_ERROR", payload: null })}
          />
        )}

        {state.crossCurrency.isLoadingPaths ? (
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">Finding best routes...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {state.crossCurrency.availablePaths.map((path, index) => (
              <Card
                key={path.id}
                className={`bg-white border-0 shadow-sm cursor-pointer transition-all duration-200 ${
                  state.crossCurrency.selectedPath?.id === path.id
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleSelectPath(path)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPathIcon(index)}
                      <div>
                        <CardTitle className="text-base font-medium">{getPathLabel(index)}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {path.hopCount} hop{path.hopCount > 1 ? "s" : ""}
                          {isUsingMockData && " (Demo)"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={index === 0 ? "default" : "secondary"} className="bg-gray-100 text-gray-700">
                      {(path.quality * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">You send</p>
                      <p className="text-lg font-medium text-gray-900">
                        {formatXRP(Number.parseFloat(path.sourceAmount))} XRP
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">They receive</p>
                      <p className="text-lg font-medium text-gray-900">
                        {formatFiat(Number.parseFloat(path.destinationAmount))} {state.targetCurrency}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rate</span>
                      <span className="text-gray-700">
                        {formatRate(calculateEffectiveRate(path), "XRP", state.targetCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Network fee</span>
                      <span className="text-gray-700">{formatXRP(path.networkFee)} XRP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Platform fee</span>
                      <span className="text-blue-600 font-medium">0%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {state.crossCurrency.selectedPath && !state.crossCurrency.isLoadingPaths && (
          <Button onClick={handleContinue} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium">
            Continue with{" "}
            {getPathLabel(
              state.crossCurrency.availablePaths.findIndex((p) => p.id === state.crossCurrency.selectedPath?.id),
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
