"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Filter, ArrowUpRight, ArrowDownLeft, X, Calendar, Hash, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useApp } from "@/lib/context"
import { truncateAddress, formatXRP, formatFiat, convertCurrency } from "@/lib/utils"

export function TransactionHistory() {
  const { state } = useApp()
  const router = useRouter()
  const [selectedTx, setSelectedTx] = useState<any>(null)

  // Mock transaction data for demo
  const mockTransactions = [
    {
      id: "1",
      hash: "A1B2C3D4E5F6",
      type: "sent",
      amount: 50,
      currency: "XRP",
      destination: "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
      source: state.wallet?.address,
      timestamp: new Date(Date.now() - 86400000),
      fee: 0.000012,
      status: "success",
      receivedAmount: 49.99,
      receivedCurrency: "XRP",
    },
    {
      id: "2",
      hash: "F6E5D4C3B2A1",
      type: "received",
      amount: 100,
      currency: "XRP",
      destination: state.wallet?.address,
      source: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      timestamp: new Date(Date.now() - 172800000),
      fee: 0.000012,
      status: "success",
      receivedAmount: 99.99,
      receivedCurrency: "XRP",
    },
    {
      id: "3",
      hash: "G7H8I9J0K1L2",
      type: "sent",
      amount: 25.5,
      currency: "XRP",
      destination: "rDNvpqSzJzk8Qx8K8VJzQzQzQzQzQzQzQz",
      source: state.wallet?.address,
      timestamp: new Date(Date.now() - 259200000),
      fee: 0.000012,
      status: "failed",
      receivedAmount: 0,
      receivedCurrency: "XRP",
    },
  ]

  const allTransactions = [...state.history, ...mockTransactions]

  const getFilteredTransactions = () => {
    if (state.historyFilter === "all") return allTransactions
    return allTransactions.filter((tx) => tx.type === state.historyFilter || tx.status === state.historyFilter)
  }

  const getTransactionIcon = (type: string, status: string) => {
    if (status === "failed") return <X className="h-4 w-4 text-red-600" />
    if (type === "sent") return <ArrowUpRight className="h-4 w-4 text-red-600" />
    return <ArrowDownLeft className="h-4 w-4 text-green-600" />
  }

  const getTransactionColor = (type: string, status: string) => {
    if (status === "failed") return "text-red-600"
    if (type === "sent") return "text-red-600"
    return "text-green-600"
  }

  const formatTransactionAmount = (tx: any) => {
    const sign = tx.type === "sent" ? "-" : "+"
    return `${sign}${formatXRP(tx.amount)} XRP`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold flex-1">History</h1>
        <Button variant="ghost" size="sm">
          <Filter className="h-4 w-4" />
        </Button>
      </header>

      <div className="p-4">
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2">
            {getFilteredTransactions().map((tx) => (
              <Card key={tx.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedTx(tx)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getTransactionIcon(tx.type, tx.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium capitalize">{tx.type}</p>
                        <p className="text-sm text-gray-600">
                          {tx.type === "sent" ? "To" : "From"}:{" "}
                          {truncateAddress(tx.type === "sent" ? tx.destination : tx.source)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getTransactionColor(tx.type, tx.status)}`}>
                          {formatTransactionAmount(tx)}
                        </p>
                        {tx.receivedAmount && tx.receivedCurrency && (
                          <p className="text-sm text-gray-600">
                            →{" "}
                            {tx.receivedCurrency === "XRP"
                              ? `${formatXRP(tx.receivedAmount)} XRP`
                              : `${formatFiat(tx.receivedAmount)} ${tx.receivedCurrency}`}
                          </p>
                        )}
                        <p className="text-xs text-green-600">Platform fee: 0%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="sent" className="space-y-2">
            {getFilteredTransactions()
              .filter((tx) => tx.type === "sent")
              .map((tx) => (
                <Card key={tx.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedTx(tx)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getTransactionIcon(tx.type, tx.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Sent</p>
                          <p className="text-sm text-gray-600">To: {truncateAddress(tx.destination)}</p>
                          <p className="text-xs text-gray-500">
                            {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${getTransactionColor(tx.type, tx.status)}`}>
                            {formatTransactionAmount(tx)}
                          </p>
                          {tx.receivedAmount && tx.receivedCurrency && (
                            <p className="text-sm text-gray-600">
                              →{" "}
                              {tx.receivedCurrency === "XRP"
                                ? `${formatXRP(tx.receivedAmount)} XRP`
                                : `${formatFiat(tx.receivedAmount)} ${tx.receivedCurrency}`}
                            </p>
                          )}
                          <p className="text-xs text-green-600">Platform fee: 0%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="received" className="space-y-2">
            {getFilteredTransactions()
              .filter((tx) => tx.type === "received")
              .map((tx) => (
                <Card key={tx.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedTx(tx)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getTransactionIcon(tx.type, tx.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Received</p>
                          <p className="text-sm text-gray-600">From: {truncateAddress(tx.source)}</p>
                          <p className="text-xs text-gray-500">
                            {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${getTransactionColor(tx.type, tx.status)}`}>
                            {formatTransactionAmount(tx)}
                          </p>
                          {tx.receivedAmount && tx.receivedCurrency && (
                            <p className="text-sm text-gray-600">
                              →{" "}
                              {tx.receivedCurrency === "XRP"
                                ? `${formatXRP(tx.receivedAmount)} XRP`
                                : `${formatFiat(tx.receivedAmount)} ${tx.receivedCurrency}`}
                            </p>
                          )}
                          <p className="text-xs text-green-600">Platform fee: 0%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="failed" className="space-y-2">
            {getFilteredTransactions()
              .filter((tx) => tx.status === "failed")
              .map((tx) => (
                <Card key={tx.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedTx(tx)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getTransactionIcon(tx.type, tx.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Failed Transaction</p>
                          <p className="text-sm text-gray-600">
                            {tx.type === "sent" ? "To" : "From"}:{" "}
                            {truncateAddress(tx.type === "sent" ? tx.destination : tx.source)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">{formatXRP(tx.amount)} XRP</p>
                          {tx.receivedAmount && tx.receivedCurrency && (
                            <p className="text-sm text-gray-600">
                              →{" "}
                              {tx.receivedCurrency === "XRP"
                                ? `${formatXRP(tx.receivedAmount)} XRP`
                                : `${formatFiat(tx.receivedAmount)} ${tx.receivedCurrency}`}
                            </p>
                          )}
                          <p className="text-xs text-green-600">Platform fee: 0%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>

      {selectedTx && (
        <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Hash</span>
                  </div>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">{selectedTx.hash}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Timestamp</span>
                  </div>
                  <p className="text-sm">{selectedTx.timestamp.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Amount</span>
                </div>
                <p className="text-lg font-semibold">{formatXRP(selectedTx.amount)} XRP</p>
                <p className="text-sm text-gray-600">
                  ≈ {formatFiat(convertCurrency(selectedTx.amount, "XRP", "USD", state.fiatRate))}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">From</span>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">{selectedTx.source}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">To</span>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">{selectedTx.destination}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Fees</span>
                <div className="bg-gray-100 p-3 rounded-lg space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Platform fee:</span>
                    <span className="text-green-600 font-medium">0.00% 🎉</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Network fee:</span>
                    <span>{formatXRP(selectedTx.fee)} XRP</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Fee</span>
                  <p className="text-sm">{formatXRP(selectedTx.fee)} XRP</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Status</span>
                  <p
                    className={`text-sm font-medium capitalize ${
                      selectedTx.status === "success"
                        ? "text-green-600"
                        : selectedTx.status === "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {selectedTx.status}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
