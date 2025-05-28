"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Wallet, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { ErrorBanner } from "@/components/ui/error-banner"
import { useApp } from "@/lib/context"
import { validateXRPAddress } from "@/lib/utils"
import { xrplService } from "@/lib/xrpl-service"
import { useToast } from "@/hooks/use-toast"
import type { Contact } from "@/lib/types"

export function AddContact() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    destinationTag: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValidatingAddress, setIsValidatingAddress] = useState(false)
  const [addressValidation, setAddressValidation] = useState<{
    isValid: boolean
    exists: boolean
    message: string
  } | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear previous validation when address changes
    if (field === "address") {
      setAddressValidation(null)
      setError(null)
    }
  }

  const validateAddress = async () => {
    if (!formData.address) return

    setIsValidatingAddress(true)
    setAddressValidation(null)

    try {
      // First check format
      const isValidFormat = validateXRPAddress(formData.address)

      if (!isValidFormat) {
        setAddressValidation({
          isValid: false,
          exists: false,
          message: "Invalid XRPL address format",
        })
        return
      }

      // Check if address exists on network
      try {
        await xrplService.getAccountInfo(formData.address)
        setAddressValidation({
          isValid: true,
          exists: true,
          message: "Valid address found on network",
        })
      } catch (error) {
        // Address format is valid but doesn't exist on network
        setAddressValidation({
          isValid: true,
          exists: false,
          message: "Valid format, but address not found on network",
        })
      }
    } catch (error) {
      setAddressValidation({
        isValid: false,
        exists: false,
        message: "Unable to validate address",
      })
    } finally {
      setIsValidatingAddress(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Name is required")
      return
    }

    if (!formData.address.trim()) {
      setError("Wallet address is required")
      return
    }

    // Validate address format
    if (!validateXRPAddress(formData.address)) {
      setError("Please enter a valid XRPL address")
      return
    }

    // Check for duplicate addresses
    const existingContact = state.contacts.find(
      (contact) => contact.address.toLowerCase() === formData.address.toLowerCase(),
    )

    if (existingContact) {
      setError(`This address is already saved as "${existingContact.name}"`)
      return
    }

    // Validate destination tag if provided
    if (formData.destinationTag) {
      const tag = Number.parseInt(formData.destinationTag)
      if (isNaN(tag) || tag < 0 || tag > 4294967295) {
        setError("Destination tag must be a number between 0 and 4294967295")
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Create new contact
      const newContact: Contact = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        address: formData.address.trim(),
        destinationTag: formData.destinationTag ? Number.parseInt(formData.destinationTag) : undefined,
        avatar: `/placeholder.svg?height=40&width=40`,
        createdAt: new Date(),
      }

      // Add to contacts list
      dispatch({ type: "ADD_CONTACT", payload: newContact })

      toast({
        title: "Contact Added",
        description: `${newContact.name} has been added to your contacts`,
      })

      // Navigate back to select receiver page
      router.push("/select-receiver")
    } catch (error: any) {
      console.error("Failed to add contact:", error)
      setError("Failed to add contact. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.address.trim() &&
      validateXRPAddress(formData.address) &&
      (!formData.destinationTag || !isNaN(Number.parseInt(formData.destinationTag)))
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Add Contact</h1>
          <p className="text-sm text-gray-500">Add a new recipient for future transfers</p>
        </div>
      </header>

      <div className="p-4">
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name or Label *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Alice Johnson, Exchange Account"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="border-gray-200"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500">This name will appear in your contact list</p>
              </div>

              {/* Address Field */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  XRPL Wallet Address *
                </Label>
                <div className="relative">
                  <Input
                    id="address"
                    type="text"
                    placeholder="rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    onBlur={validateAddress}
                    className="font-mono text-sm border-gray-200 pr-10"
                  />
                  {isValidatingAddress && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Spinner size="sm" />
                    </div>
                  )}
                  {addressValidation && !isValidatingAddress && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {addressValidation.isValid ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-red-600"></div>
                        </div>
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
                          : "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {addressValidation.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">The recipient's XRPL address (starts with 'r')</p>
              </div>

              {/* Destination Tag Field */}
              <div className="space-y-2">
                <Label htmlFor="destinationTag" className="text-sm font-medium text-gray-700">
                  Destination Tag (Optional)
                </Label>
                <Input
                  id="destinationTag"
                  type="number"
                  placeholder="e.g., 12345"
                  value={formData.destinationTag}
                  onChange={(e) => handleInputChange("destinationTag", e.target.value)}
                  className="border-gray-200"
                  min="0"
                  max="4294967295"
                />
                <p className="text-xs text-gray-500">Required for some exchanges and hosted wallets</p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium text-sm">About Destination Tags</p>
                    <p className="text-blue-700 text-xs mt-1">
                      Destination tags are required when sending to exchanges like Binance, Coinbase, or other hosted
                      wallets. Check with the recipient if you're unsure.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Adding Contact...
                  </>
                ) : (
                  "Add Contact"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Addresses */}
        <Card className="bg-white border-0 shadow-sm mt-4">
          <CardHeader>
            <CardTitle className="text-base font-medium text-gray-900">Demo Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">You can use these demo addresses for testing:</p>
            <div className="space-y-2">
              {[
                { name: "Demo User 1", address: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH" },
                { name: "Demo User 2", address: "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w" },
                { name: "Demo Exchange", address: "rDNvpqSzJzk8Qx8K8VJzQzQzQzQzQzQzQz", tag: "12345" },
              ].map((demo, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      name: demo.name,
                      address: demo.address,
                      destinationTag: demo.tag || "",
                    })
                  }}
                  className="w-full justify-start text-left border-gray-200"
                >
                  <div>
                    <p className="font-medium text-sm">{demo.name}</p>
                    <p className="font-mono text-xs text-gray-500">
                      {demo.address.slice(0, 10)}...{demo.address.slice(-6)}
                      {demo.tag && ` • Tag: ${demo.tag}`}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
