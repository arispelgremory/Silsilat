"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CustomScrollArea } from "@/components/ui/custom-scroll-area"
import { Bot, Send, X, MessageSquare, Loader2, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateEnhancedResponse } from "@/components/ai-chat/enhanced-chat-service"
import { Badge } from "@/components/ui/badge"

type Message = {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  links?: { text: string; url: string }[]
  goldPrice?: {
    value: number
    unit: string
    currency: string
    timestamp: string
  }
}

export function EnhancedChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm Silsilat AI Assistant. How can I help you with information about our Shariah-compliant jewelry financing services?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage = {
      role: "user" as const,
      content: input.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsThinking(true)

    // Add thinking indicator
    const thinkingMessage = {
      role: "system" as const,
      content: "Thinking...",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, thinkingMessage])

    try {
      // Generate AI response
      const response = await generateEnhancedResponse(
        input.trim(),
        messages.filter((m) => m.role !== "system"),
      )

      // Remove thinking message
      setMessages((prev) => prev.filter((m) => m.content !== "Thinking..."))
      setIsThinking(false)

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.text,
          timestamp: new Date(),
          links: response.links,
          goldPrice: response.goldPrice,
        },
      ])
    } catch (error) {
      console.error("Error generating response:", error)

      // Remove thinking message
      setMessages((prev) => prev.filter((m) => m.content !== "Thinking..."))
      setIsThinking(false)

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble processing your request. Please try again later or contact our support team.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Format message content with links
  const formatMessageContent = (message: Message) => {
    if (message.role === "system") {
      return (
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {message.content}
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <div>{message.content}</div>

        {message.goldPrice && (
          <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Gold Price:</span>
              <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900">
                {message.goldPrice.value} {message.goldPrice.currency}/{message.goldPrice.unit}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Last updated: {message.goldPrice.timestamp}</div>
          </div>
        )}

        {message.links && message.links.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium mb-1">Helpful resources:</p>
            <ul className="space-y-1">
              {message.links.map((link, index) => (
                <li key={index} className="text-sm">
                  <a
                    href={link.url}
                    className="text-emerald-600 hover:underline flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Chat button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg bg-emerald-600 hover:bg-emerald-700"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Chat widget */}
      <div
        className={cn(
          "fixed bottom-4 right-4 z-50 w-80 md:w-96 transition-all duration-300 ease-in-out transform",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none",
        )}
      >
        <Card className="border shadow-xl">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-emerald-600 text-white rounded-t-lg">
            <CardTitle className="text-base font-medium flex items-center">
              <Bot className="mr-2 h-5 w-5" />
              Silsilat AI Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-white hover:bg-emerald-700 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <CustomScrollArea className="h-[350px] p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex",
                      message.role === "user"
                        ? "justify-end"
                        : message.role === "system"
                          ? "justify-center"
                          : "justify-start",
                    )}
                  >
                    {message.role !== "system" && (
                      <div
                        className={cn(
                          "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                          message.role === "user" ? "bg-emerald-600 text-white" : "bg-gray-100 dark:bg-gray-800",
                        )}
                      >
                        {formatMessageContent(message)}
                      </div>
                    )}
                    {message.role === "system" && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">{formatMessageContent(message)}</div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CustomScrollArea>
          </CardContent>
          <CardFooter className="p-3 border-t">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                ref={inputRef}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
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
