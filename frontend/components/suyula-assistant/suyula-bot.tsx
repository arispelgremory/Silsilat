"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CustomScrollArea } from "@/components/ui/custom-scroll-area"
import {
  Bot,
  Send,
  X,
  MessageSquare,
  Loader2,
  Mic,
  Paperclip,
  TrendingUp,
  FileText,
  Shield,
  Building2,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/hooks/use-language"
import { SuyulaBotService } from "./suyula-bot-service"

type UserMode = "investor" | "arRahnu" | "admin" | "guest"

type Message = {
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

export function SuyulaBot() {
  const { t, language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userMode, setUserMode] = useState<UserMode>("guest")
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const botService = new SuyulaBotService()

  // Initialize bot
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: t("chatbot.responses.welcome"),
        timestamp: new Date(),
        actions: [
          {
            label: t("chatbot.quickActions.showListings"),
            action: "show_listings",
            icon: <FileText className="h-4 w-4" />,
          },
          {
            label: t("chatbot.quickActions.checkPortfolio"),
            action: "check_portfolio",
            icon: <TrendingUp className="h-4 w-4" />,
          },
          { label: t("chatbot.quickActions.kycStatus"), action: "kyc_status", icon: <Shield className="h-4 w-4" /> },
          {
            label: t("chatbot.quickActions.helpGuide"),
            action: "help_guide",
            icon: <MessageSquare className="h-4 w-4" />,
          },
        ],
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, t, messages.length])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Detect user mode based on wallet/session
  useEffect(() => {
    const detectUserMode = () => {
      const userRole = localStorage.getItem("userRole")
      const isAuthenticated = localStorage.getItem("isAuthenticated")

      if (isAuthenticated === "true") {
        if (userRole === "admin" || userRole === "ceo") {
          setUserMode("admin")
        } else if (userRole === "branchManager") {
          setUserMode("arRahnu")
        } else {
          setUserMode("investor")
        }
      } else {
        setUserMode("guest")
      }
    }

    detectUserMode()
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      mode: userMode,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await botService.processMessage(input.trim(), userMode, language, messages)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.text,
        timestamp: new Date(),
        actions: response.actions,
        data: response.data,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Bot error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t("chatbot.responses.error"),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = async (action: string) => {
    setIsLoading(true)

    try {
      const response = await botService.handleQuickAction(action, userMode, language)

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response.text,
        timestamp: new Date(),
        actions: response.actions,
        data: response.data,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Quick action error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = () => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.lang = language === "my" ? "ms-MY" : "en-US"
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
      }

      recognition.start()
    }
  }

  const getModeIcon = (mode: UserMode) => {
    switch (mode) {
      case "investor":
        return <TrendingUp className="h-4 w-4" />
      case "arRahnu":
        return <Building2 className="h-4 w-4" />
      case "admin":
        return <Shield className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getModeColor = (mode: UserMode) => {
    switch (mode) {
      case "investor":
        return "bg-blue-100 text-blue-800"
      case "arRahnu":
        return "bg-green-100 text-green-800"
      case "admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      {/* Floating Bot Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-50"
        size="icon"
      >
        <div className="relative">
          <Bot className="h-8 w-8 text-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </Button>

      {/* Bot Widget */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-96 transition-all duration-300 ease-in-out transform",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none",
        )}
      >
        <Card className="border shadow-2xl bg-white">
          <CardHeader className="py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bot className="h-8 w-8" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">{t("chatbot.title")}</CardTitle>
                  <p className="text-sm opacity-90">{t("chatbot.subtitle")}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Mode Indicator */}
            <div className="flex items-center justify-between mt-2">
              <Badge className={cn("text-xs", getModeColor(userMode))}>
                {getModeIcon(userMode)}
                <span className="ml-1">{t(`chatbot.modes.${userMode}`)}</span>
              </Badge>
              <div className="text-xs opacity-75">{language === "my" ? "🇲🇾 Bahasa Melayu" : "🇺🇸 English"}</div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <CustomScrollArea className="h-96 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg px-4 py-2",
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800",
                      )}
                    >
                      <div className="text-sm">{message.content}</div>

                      {/* Quick Actions */}
                      {message.actions && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.actions.map((action, index) => (
                            <Button
                              key={index}
                              variant={action.variant || "outline"}
                              size="sm"
                              onClick={() => handleQuickAction(action.action)}
                              className="text-xs h-8"
                            >
                              {action.icon}
                              <span className="ml-1">{action.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Data Display */}
                      {message.data && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          {message.data.type === "sag_list" && (
                            <div className="space-y-2">
                              {message.data.items.map((sag: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-2 border rounded">
                                  <div>
                                    <div className="font-medium">SAG #{sag.id}</div>
                                    <div className="text-xs text-gray-500">
                                      {sag.duration} • {sag.profit}% profit
                                    </div>
                                  </div>
                                  <Badge variant={sag.status === "active" ? "default" : "secondary"}>
                                    {sag.subscribed}% filled
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}

                          {message.data.type === "portfolio" && (
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Total Investment:</span>
                                <span className="font-bold">RM {message.data.totalInvestment}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Current Value:</span>
                                <span className="font-bold text-green-600">RM {message.data.currentValue}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Profit:</span>
                                <span className="font-bold text-green-600">+RM {message.data.profit}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-sm">{t("chatbot.responses.processing")}</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </CustomScrollArea>
          </CardContent>

          <CardFooter className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  placeholder={t("chatbot.placeholder")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleVoiceInput}
                    disabled={isLoading}
                  >
                    <Mic className={cn("h-3 w-3", isListening && "text-red-500 animate-pulse")} />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={isLoading}>
                    <Paperclip className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
