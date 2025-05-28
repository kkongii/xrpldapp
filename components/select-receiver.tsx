"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, QrCode, UserPlus, Camera, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/context"
import { truncateAddress } from "@/lib/utils"

export function SelectReceiver() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("contacts")
  const [isScanning, setIsScanning] = useState(false)

  const handleSelectContact = (address: string) => {
    dispatch({ type: "SET_RECEIVER_ADDRESS", payload: address })
    router.push("/enter-amount")
  }

  const handleAddNew = () => {
    router.push("/add-contact")
  }

  const handleQRScan = () => {
    setIsScanning(true)
    // Simulate QR scan
    setTimeout(() => {
      const mockScannedAddress = "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w"
      dispatch({ type: "SET_RECEIVER_ADDRESS", payload: mockScannedAddress })
      setIsScanning(false)
      router.push("/enter-amount")
    }, 2000)
  }

  // Sort contacts by creation date (newest first)
  const sortedContacts = [...state.contacts].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold text-gray-900">Select Receiver</h1>
      </header>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="qr">QR Scan</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-medium text-gray-700">Saved Contacts</h2>
              <Button variant="outline" size="sm" onClick={handleAddNew} className="border-gray-200 text-gray-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>

            <div className="space-y-3">
              {sortedContacts.length === 0 ? (
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No contacts yet</p>
                    <p className="text-gray-500 text-sm mb-4">Add your first contact to get started</p>
                    <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white">
                      Add Contact
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                sortedContacts.map((contact) => (
                  <Card
                    key={contact.id}
                    className="bg-white border-0 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSelectContact(contact.address)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                          {contact.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          {contact.destinationTag && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                              <Hash className="h-3 w-3 mr-1" />
                              {contact.destinationTag}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 font-mono">{truncateAddress(contact.address)}</p>
                        {contact.createdAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Added {new Date(contact.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="qr">
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                {isScanning ? (
                  <div className="space-y-4">
                    <div className="mx-auto h-48 w-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Camera className="h-12 w-12 text-gray-400 animate-pulse" />
                    </div>
                    <p className="text-gray-600">Scanning for QR code...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto h-48 w-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <QrCode className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600">Point your camera at a QR code</p>
                      <Button onClick={handleQRScan} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Camera className="mr-2 h-4 w-4" />
                        Start Scanning
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
