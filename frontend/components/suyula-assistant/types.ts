import type React from "react"
export type UserMode = "investor" | "arRahnu" | "admin" | "guest"

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  mode?: UserMode
  actions?: Array<{
    label: string
    action: string
    icon?: React.ReactNode
    variant?: "default" | "outline" | "destructive"
  }>
  data?: any
}

export interface BotResponse {
  text: string
  actions?: Array<{
    label: string
    action: string
    icon?: React.ReactNode
    variant?: "default" | "outline" | "destructive"
  }>
  data?: any
}

export interface SAGData {
  id: string
  duration: string
  profit: number
  subscribed: number
  status: string
  amount: number
}

export interface PortfolioData {
  totalInvestment: number
  currentValue: number
  profit: number
  investments: Array<{
    sagId: string
    amount: number
    currentValue: number
    profit: number
  }>
}
