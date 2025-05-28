"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Wallet, Smartphone, AlertTriangle, Info, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { ErrorBanner } from "@/components/ui/error-banner"
import { useApp } from "@/lib/context"
import { xrplService } from "@/lib/xrpl-service"
import { validateXRPAddress } from "@/lib/utils"

// Only XRPL-compatible wallet options
const walletOptions = [
  {
    value: "XUMM",
    label: "XUMM",
    icon: Smartphone,
    description: "Native XRPL wallet with full cross-currency support",
    supported: true,
  },
  {
    value: "Manual",
    label: "Manual Entry",
    icon: Wallet,
    description: "Enter XRPL address directly for demo purposes",
    supported: true,
  },
]

// Unsupported wallets (shown with warning)
const unsupportedWallets = [
  {
    value: "WalletConnect",
    label: "WalletConnect",
    icon: Wallet,
    description: "EVM-based wallets not supported for XRPL",
    reason: "WalletConnect primarily supports Ethereum and EVM-compatible networks, not XRPL",
  },
  {
    value: "MetaMask",
    label: "MetaMask",
    icon: Wallet,
    description: "Ethereum wallet not compatible with XRPL",
    reason: "MetaMask is designed for Ethereum and does not support XRPL addresses or transactions",
  },
]

const DEMO_ADDRESSES = [
  "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
  "rDNvpqSzJzk8Qx8K8VJzQzQzQzQzQzQzQz",
]

export function WalletConnect() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const [selectedWallet, setSelectedWallet] = useState<string>("")
  const [manualAddress, setManualAddress] = useState("")
  const [showUnsupported, setShowUnsupported] = useState(false)
  const [addressValidation, setAddressValidation] = useState<{
    isValid: boolean
    exists: boolean | null
    message: string
  } | null>(null)

  const validateAddressFormat = (address: string) => {
    if (!address) {
      setAddressValidation(null)
      return
    }

    // Only validate format, don't check network
    const isValidFormat = validateXRPAddress(address)

    if (!isValidFormat) {
      setAddressValidation({
        isValid: false,
        exists: null,
        message: "Invalid XRPL address format. Must start with 'r' and be 25-34 characters.",
      })
      return
    }

    // If format is valid, mark as valid without network check
    if (DEMO_ADDRESSES.includes(address)) {
      setAddressValidation({
        isValid: true,
        exists: true,
        message: "Valid demo address",
      })
    } else {
      setAddressValidation({
        isValid: true,
        exists: null,
        message: "Valid XRPL address format (demo mode)",
      })
    }
  }

  const handleConnect = async () => {
    if (!selectedWallet) return

    dispatch({ type: "SET_CONNECTING", payload: true })
    dispatch({ type: "SET_CONNECTION_ERROR", payload: null })

    try {
      // Connect to XRPL network first (but don't fail if it doesn't work)
      try {
        await xrplService.connect()
      } catch (error) {
        console.log("XRPL network connection failed, continuing in demo mode:", error)
      }

      let walletAddress = ""

      if (selectedWallet === "Manual") {
        // Manual wallet entry with strict XRPL validation
        if (!manualAddress) {
          throw new Error("Please enter an XRPL address")
        }

        // Validate the address format strictly
        if (!validateXRPAddress(manualAddress)) {
          throw new Error("Invalid XRPL address format. Address must start with 'r' and be 25-34 characters long.")
        }

        walletAddress = manualAddress.trim()
        console.log("Using manual XRPL address:", walletAddress)
      } else if (selectedWallet === "XUMM") {
        // Simulate XUMM connection
        await new Promise((resolve) => setTimeout(resolve, 2000))
        walletAddress = DEMO_ADDRESSES[0]
        console.log("Simulating XUMM connection with demo address:", walletAddress)
      } else {
        throw new Error("Unsupported wallet type for XRPL")
      }

      // Final validation of the wallet address format
      if (!validateXRPAddress(walletAddress)) {
        throw new Error("Generated wallet address is not a valid XRPL address. Please try again.")
      }

      // Always use demo balance to avoid network validation errors
      const balance = 1250.32 // Demo balance
      console.log("Using demo balance for all addresses:", balance)

      const wallet = {
        address: walletAddress,
        provider: selectedWallet as "XUMM" | "WalletConnect",
      }

      console.log("XRPL wallet connected successfully:", wallet)
      dispatch({ type: "SET_WALLET", payload: wallet })
      dispatch({ type: "SET_BALANCE", payload: balance })

      router.push("/balance")
    } catch (error: any) {
      console.error("Connection error:", error)
      dispatch({
        type: "SET_CONNECTION_ERROR",
        payload: error.message || "Failed to connect wallet. Please try again.",
      })
    } finally {
      dispatch({ type: "SET_CONNECTING", payload: false })
    }
  }

  const handleDemoAddress = (address: string) => {
    setManualAddress(address)
    setAddressValidation({
      isValid: true,
      exists: true,
      message: "Valid demo address",
    })
  }

  const handleAddressChange = (value: string) => {
    setManualAddress(value)
    validateAddressFormat(value)
  }

  const networkInfo = xrplService.getNetworkInfo()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-sm border-0">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Wallet className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">Connect XRPL Wallet</CardTitle>
          <CardDescription className="text-gray-500">
            Choose an XRPL-compatible wallet for cross-currency transfers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.connectionError && (
            <ErrorBanner
              message={state.connectionError}
              onDismiss={() => dispatch({ type: "SET_CONNECTION_ERROR", payload: null })}
            />
          )}

          {/* Demo Mode Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-blue-800 font-medium text-sm">Demo Mode</span>
            </div>
            <p className="text-blue-700 text-xs">All wallets will use demo data for safe testing</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Select XRPL Wallet</Label>
            <Select value={selectedWallet} onValueChange={setSelectedWallet}>
              <SelectTrigger className="border-gray-200">
                <SelectValue placeholder="Choose an XRPL-compatible wallet" />
              </SelectTrigger>
              <SelectContent>
                {walletOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-xs text-gray-500">{option.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Manual Address Entry */}
          {selectedWallet === "Manual" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  XRPL Classic Address
                </Label>
                <div className="relative">
                  <Input
                    id="address"
                    type="text"
                    placeholder="rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"
                    value={manualAddress}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    className="font-mono text-sm border-gray-200 pr-10"
                  />
                  {addressValidation && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {addressValidation.isValid ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
                {addressValidation && (
                  <p
                    className={`text-xs ${
                      addressValidation.isValid
                        ? addressValidation.exists
                          ? "text-green-600"
                          : "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {addressValidation.message}
                  </p>
                )}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                  <p className="text-yellow-800 text-xs">
                    <strong>XRPL Address Requirements:</strong>
                    <br />• Must start with 'r'
                    <br />• Must be 25-34 characters long
                    <br />• Only classic addresses supported (no X-addresses)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Demo XRPL Addresses:</p>
                <div className="grid gap-1">
                  {DEMO_ADDRESSES.map((address, index) => (
                    <Button
                      key={address}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoAddress(address)}
                      className="justify-start font-mono text-xs border-gray-200 text-gray-600"
                    >
                      Demo {index + 1}: {address.slice(0, 10)}...
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* XUMM Specific Info */}
          {selectedWallet === "XUMM" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium text-sm">XUMM Integration</p>
                  <p className="text-green-700 text-xs mt-1">
                    XUMM is the native XRPL wallet with full support for cross-currency payments and DEX functionality.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleConnect}
            disabled={
              !selectedWallet ||
              state.isConnecting ||
              (selectedWallet === "Manual" && (!manualAddress || !addressValidation?.isValid))
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {state.isConnecting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Connecting...
              </>
            ) : (
              "Connect Wallet"
            )}
          </Button>

          {/* Unsupported Wallets Warning */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUnsupported(!showUnsupported)}
              className="w-full text-gray-500 text-xs"
            >
              {showUnsupported ? "Hide" : "Show"} unsupported wallets
            </Button>

            {showUnsupported && (
              <div className="space-y-2">
                {unsupportedWallets.map((wallet) => {
                  const Icon = wallet.icon
                  return (
                    <div key={wallet.value} className="bg-red-50 border border-red-200 rounded-lg p-3 opacity-60">
                      <div className="flex items-start gap-3">
                        <Icon className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-red-800 text-sm">{wallet.label}</p>
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                          </div>
                          <p className="text-red-700 text-xs mb-1">{wallet.description}</p>
                          <p className="text-red-600 text-xs">{wallet.reason}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="text-center">
            <a
              href="https://xrpl.org/xrp-testnet-faucet.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Need testnet XRP? Get it from the faucet
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
