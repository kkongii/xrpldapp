export interface Wallet {
  address: string
  provider: "XUMM" | "WalletConnect" | "Ledger"
}

export interface Contact {
  id: string
  name: string
  address: string
  destinationTag?: number
  avatar?: string
  createdAt?: Date
}

export interface Transaction {
  id: string
  hash: string
  type: "sent" | "received" | "failed"
  amount: number
  currency: string
  destination?: string
  source?: string
  timestamp: Date
  fee: number
  status: "success" | "failed" | "pending"
  memo?: string
}

export interface PathOption {
  id: string
  paths: any[]
  sourceAmount: string
  destinationAmount: string
  rate: number
  networkFee: number
  hopCount: number
  quality: number
}

export interface CrossCurrencyState {
  availablePaths: PathOption[]
  selectedPath: PathOption | null
  isLoadingPaths: boolean
  pathError: string | null
}

export interface AppState {
  // Wallet connection
  wallet: Wallet | null
  isConnecting: boolean
  connectionError: string | null

  // Balance
  balance: number
  fiatRate: number
  isLoadingBalance: boolean
  balanceError: string | null

  // Contacts
  contacts: Contact[]

  // Transaction history
  history: Transaction[]
  historyFilter: "all" | "sent" | "received" | "failed"
  isLoadingHistory: boolean
  historyError: string | null

  // Cross-currency routing
  crossCurrency: CrossCurrencyState

  // Transaction flow
  receiverAddress: string
  amountInput: string
  selectedCurrency: "XRP" | "USD" | "KRW"
  targetCurrency: "XRP" | "USD" | "KRW"
  convertedXrp: number
  isSubmitting: boolean
  txError: string | null
}
