"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { AppState, Wallet, Transaction, PathOption, Contact } from "./types"

const initialState: AppState = {
  wallet: null,
  isConnecting: false,
  connectionError: null,
  balance: 0,
  fiatRate: 0.58, // Mock XRP to USD rate
  isLoadingBalance: false,
  balanceError: null,
  contacts: [
    {
      id: "1",
      name: "Alice Johnson",
      address: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
      avatar: "/placeholder.svg?height=40&width=40",
      createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
    },
    {
      id: "2",
      name: "Bob Smith",
      address: "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
      avatar: "/placeholder.svg?height=40&width=40",
      createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
    },
    {
      id: "3",
      name: "Carol Davis",
      address: "rDNvpqSzJzk8Qx8K8VJzQzQzQzQzQzQzQz",
      destinationTag: 12345,
      avatar: "/placeholder.svg?height=40&width=40",
      createdAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
    },
  ],
  history: [],
  historyFilter: "all",
  isLoadingHistory: false,
  historyError: null,
  receiverAddress: null,
  amountInput: "",
  selectedCurrency: "XRP",
  convertedXrp: 0,
  isSubmitting: false,
  txError: null,
  crossCurrency: {
    availablePaths: [],
    selectedPath: null,
    isLoadingPaths: false,
    pathError: null,
  },
  targetCurrency: "USD", // Default target currency
}

type Action =
  | { type: "SET_CONNECTING"; payload: boolean }
  | { type: "SET_WALLET"; payload: Wallet | null }
  | { type: "SET_CONNECTION_ERROR"; payload: string | null }
  | { type: "SET_BALANCE"; payload: number }
  | { type: "SET_FIAT_RATE"; payload: number }
  | { type: "SET_LOADING_BALANCE"; payload: boolean }
  | { type: "SET_BALANCE_ERROR"; payload: string | null }
  | { type: "SET_RECEIVER_ADDRESS"; payload: string | null }
  | { type: "SET_AMOUNT_INPUT"; payload: string }
  | { type: "SET_SELECTED_CURRENCY"; payload: "XRP" | "USD" | "KRW" }
  | { type: "SET_CONVERTED_XRP"; payload: number }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_TX_ERROR"; payload: string | null }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "SET_HISTORY"; payload: Transaction[] }
  | { type: "SET_HISTORY_FILTER"; payload: "all" | "sent" | "received" | "failed" }
  | { type: "SET_LOADING_HISTORY"; payload: boolean }
  | { type: "LOGOUT" }
  | { type: "SET_TARGET_CURRENCY"; payload: "XRP" | "USD" | "KRW" }
  | { type: "SET_LOADING_PATHS"; payload: boolean }
  | { type: "SET_AVAILABLE_PATHS"; payload: PathOption[] }
  | { type: "SET_SELECTED_PATH"; payload: PathOption | null }
  | { type: "SET_PATH_ERROR"; payload: string | null }
  | { type: "ADD_CONTACT"; payload: Contact }
  | { type: "UPDATE_CONTACT"; payload: Contact }
  | { type: "DELETE_CONTACT"; payload: string }

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_CONNECTING":
      return { ...state, isConnecting: action.payload }
    case "SET_WALLET":
      return { ...state, wallet: action.payload }
    case "SET_CONNECTION_ERROR":
      return { ...state, connectionError: action.payload }
    case "SET_BALANCE":
      return { ...state, balance: action.payload }
    case "SET_FIAT_RATE":
      return { ...state, fiatRate: action.payload }
    case "SET_LOADING_BALANCE":
      return { ...state, isLoadingBalance: action.payload }
    case "SET_BALANCE_ERROR":
      return { ...state, balanceError: action.payload }
    case "SET_RECEIVER_ADDRESS":
      return { ...state, receiverAddress: action.payload }
    case "SET_AMOUNT_INPUT":
      return { ...state, amountInput: action.payload }
    case "SET_SELECTED_CURRENCY":
      return { ...state, selectedCurrency: action.payload }
    case "SET_CONVERTED_XRP":
      return { ...state, convertedXrp: action.payload }
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.payload }
    case "SET_TX_ERROR":
      return { ...state, txError: action.payload }
    case "ADD_TRANSACTION":
      return { ...state, history: [action.payload, ...state.history] }
    case "SET_HISTORY":
      return { ...state, history: action.payload }
    case "SET_HISTORY_FILTER":
      return { ...state, historyFilter: action.payload }
    case "SET_LOADING_HISTORY":
      return { ...state, isLoadingHistory: action.payload }
    case "LOGOUT":
      return { ...initialState, contacts: state.contacts }
    case "SET_TARGET_CURRENCY":
      return { ...state, targetCurrency: action.payload }
    case "SET_LOADING_PATHS":
      return {
        ...state,
        crossCurrency: { ...state.crossCurrency, isLoadingPaths: action.payload },
      }
    case "SET_AVAILABLE_PATHS":
      return {
        ...state,
        crossCurrency: { ...state.crossCurrency, availablePaths: action.payload },
      }
    case "SET_SELECTED_PATH":
      return {
        ...state,
        crossCurrency: { ...state.crossCurrency, selectedPath: action.payload },
      }
    case "SET_PATH_ERROR":
      return {
        ...state,
        crossCurrency: { ...state.crossCurrency, pathError: action.payload },
      }
    case "ADD_CONTACT":
      return {
        ...state,
        contacts: [action.payload, ...state.contacts],
      }
    case "UPDATE_CONTACT":
      return {
        ...state,
        contacts: state.contacts.map((contact) => (contact.id === action.payload.id ? action.payload : contact)),
      }
    case "DELETE_CONTACT":
      return {
        ...state,
        contacts: state.contacts.filter((contact) => contact.id !== action.payload),
      }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
