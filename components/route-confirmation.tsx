"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Zap, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { ErrorBanner } from "@/components/ui/error-banner"
import { useApp } from "@/lib/context"
import {
  findCurrencyPaths,
  calculateEffectiveRate,
  formatRate,
  formatXRP,
  formatFiat,
  truncateAddress,
} from "@/lib/utils"
import { xrplService } from "@/lib/xrpl-service"
import type { PathOption } from "@/lib/types"

export function RouteConfirmation() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const [selectedRoute, setSelectedRoute] = useState<PathOption | null>(null)

  useEffect(() => {
    loadPaths()
  }, [state.amountInput, state.selectedCurrency, state.targetCurrency])

  const loadPaths = async () => {
    if (!state.wallet?.address || !state.receiverAddress || !state.amountInput) {
      console.log("Missing required data for path finding")
      return
    }

    dispatch({ type: "SET_LOADING_PATHS", payload: true })
    dispatch({ type: "SET_PATH_ERROR", payload: null })

    try {
      console.log("Loading currency paths for route confirmation (demo mode)...")

      // Always use demo paths to avoid network validation errors
      const paths = await findCurrencyPaths(
        state.wallet.address,
        state.receiverAddress,
        state.amountInput,
        state.targetCurrency,
      )

      console.log("Loaded demo paths:", paths)

      dispatch({ type: "SET_AVAILABLE_PATHS", payload: paths })

      // Auto-select best rate (first in sorted array)
      if (paths.length > 0) {
        setSelectedRoute(paths[0])
        dispatch({ type: "SET_SELECTED_PATH", payload: paths[0] })
      }
    } catch (error: any) {
      console.error("Path loading error:", error)
      dispatch({
        type: "SET_PATH_ERROR",
        payload: "Failed to load routes - using demo data",
      })

      // Generate fallback demo paths
      const fallbackPaths: PathOption[] = [
        {
          id: "fallback_demo",
          paths: [],
          sourceAmount: (Number(state.amountInput) * 1.72).toFixed(6),
          destinationAmount: state.amountInput,
          rate: 0.58,
          networkFee: 0.000012,
          hopCount: 1,
          quality: 0.99,
        },
      ]

      dispatch({ type: "SET_AVAILABLE_PATHS", payload: fallbackPaths })
      if (fallbackPaths.length > 0) {
        setSelectedRoute(fallbackPaths[0])
        dispatch({ type: "SET_SELECTED_PATH", payload: fallbackPaths[0] })
      }
    } finally {
      dispatch({ type: "SET_LOADING_PATHS", payload: false })
    }
  }

  const handleSelectRoute = (path: PathOption) => {
    setSelectedRoute(path)
    dispatch({ type: "SET_SELECTED_PATH", payload: path })
  }

  const handleConfirmRoute = () => {
    router.push("/confirm")
  }

  const handleRetry = () => {
    loadPaths()
  }

  const getRouteIcon = (index: number) => {
    if (index === 0) return <Zap className="h-4 w-4 text-blue-600" />
    if (index === 1) return <TrendingUp className="h-4 w-4 text-green-600" />
    return <Clock className="h-4 w-4 text-orange-600" />
  }

  const getRouteLabel = (index: number) => {
    if (index === 0) return "Best Rate"
    if (index === 1) return "Fast"
    return "Stable"
  }

  const networkInfo = xrplService.getNetworkInfo()
  const amount = Number.parseFloat(state.amountInput) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">Confirm Route</h1>
          <p className="text-sm text-gray-500">Review your cross-currency payment route</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <span className="text-xs text-gray-600">Demo</span>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Transaction Summary */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-gray-900">Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">You Send</p>
                <p className="text-xl font-bold text-gray-900">
                  {amount} {state.selectedCurrency}
                </p>
                <p className="text-xs text-gray-500">From: {truncateAddress(state.wallet?.address || "")}</p>
              </div>

              <div className="flex items-center">
                <ArrowRight className="h-6 w-6 text-gray-400" />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">They Receive</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedRoute ? formatFiat(Number.parseFloat(selectedRoute.destinationAmount)) : "..."}{" "}
                  {state.targetCurrency}
                </p>
                <p className="text-xs text-gray-500">To: {truncateAddress(state.receiverAddress || "")}</p>
              </div>
            </div>

            {selectedRoute && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-800 font-medium text-sm">Exchange Rate</span>
                  <span className="text-blue-900 font-semibold">
                    {formatRate(calculateEffectiveRate(selectedRoute), state.selectedCurrency, state.targetCurrency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 text-xs">Platform Fee</span>
                  <span className="text-blue-800 font-medium text-xs">0% 🎉</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Mode Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
          <div className="h-4 w-4 rounded-full bg-blue-500 flex-shrink-0"></div>
          <div className="flex-1">
            <p className="text-blue-800 font-medium text-sm">Demo Mode Active</p>
            <p className="text-blue-700 text-xs">Using simulated exchange rates and routes</p>
          </div>
        </div>

        {state.crossCurrency.pathError && (
          <ErrorBanner
            message={state.crossCurrency.pathError}
            onDismiss={() => dispatch({ type: "SET_PATH_ERROR", payload: null })}
          />
        )}

        {/* Route Selection */}
        {state.crossCurrency.isLoadingPaths ? (
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">Finding best exchange routes...</p>
              <p className="text-gray-500 text-sm mt-1">Analyzing demo liquidity pools</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-gray-900">Available Routes</h2>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {state.crossCurrency.availablePaths.length} found
              </Badge>
            </div>

            {state.crossCurrency.availablePaths.map((path, index) => (
              <Card
                key={path.id}
                className={`bg-white border-0 shadow-sm cursor-pointer transition-all duration-200 ${
                  selectedRoute?.id === path.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                }`}
                onClick={() => handleSelectRoute(path)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getRouteIcon(index)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{getRouteLabel(index)}</span>
                          {selectedRoute?.id === path.id && <CheckCircle className="h-4 w-4 text-blue-600" />}
                        </div>
                        <p className="text-sm text-gray-500">
                          {path.hopCount} hop{path.hopCount > 1 ? "s" : ""} (Demo)
                        </p>
                      </div>
                    </div>
                    <Badge variant={index === 0 ? "default" : "secondary"} className="bg-gray-100 text-gray-700">
                      {(path.quality * 100).toFixed(1)}% efficiency
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">You pay (XRP)</p>
                      <p className="font-medium text-gray-900">{formatXRP(Number.parseFloat(path.sourceAmount))}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Exchange rate</p>
                      <p className="font-medium text-gray-900">
                        {formatRate(calculateEffectiveRate(path), "XRP", state.targetCurrency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Network fee</p>
                      <p className="font-medium text-gray-900">{formatXRP(path.networkFee)}</p>
                    </div>
                  </div>

                  {path.hopCount > 1 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Route path:</p>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="bg-gray-100 px-2 py-1 rounded">XRP</span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span className="bg-gray-100 px-2 py-1 rounded">{state.targetCurrency}</span>
                        {path.hopCount > 2 && (
                          <>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span className="bg-gray-100 px-2 py-1 rounded">...</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Fee Breakdown */}
        {selectedRoute && (
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-gray-900">Fee Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-medium text-blue-600">0% (Free!)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">XRPL Network Fee</span>
                <span className="font-medium text-gray-900">{formatXRP(selectedRoute.networkFee)} XRP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Exchange Spread</span>
                <span className="font-medium text-gray-900">~0.1-0.3%</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between items-center font-medium">
                <span className="text-gray-900">Total Cost</span>
                <span className="text-gray-900">
                  {formatXRP(Number.parseFloat(selectedRoute.sourceAmount) + selectedRoute.networkFee)} XRP
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="h-12 border-gray-200 text-gray-700 font-medium"
          >
            Back
          </Button>
          <Button
            onClick={handleConfirmRoute}
            disabled={!selectedRoute || state.crossCurrency.isLoadingPaths}
            className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {selectedRoute ? "Confirm Route" : "Select Route"}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-gray-700 text-sm font-medium mb-1">About Cross-Currency Payments</p>
          <p className="text-gray-600 text-xs leading-relaxed">
            XRPL automatically finds the best exchange rate by analyzing multiple liquidity pools and market makers. The
            route shown provides the most efficient simulated conversion from {state.selectedCurrency} to{" "}
            {state.targetCurrency}.
          </p>
        </div>
      </div>
    </div>
  )
}
