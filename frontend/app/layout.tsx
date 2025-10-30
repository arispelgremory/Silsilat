import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/hooks/use-language"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EnhancedChatWidget } from "@/components/ai-chat/enhanced-chat-widget"
import { Toaster } from "@/components/ui/sonner"
import { ConditionalLayout } from "@/components/conditional-layout"
import { QueryProvider } from "@/components/query-client-provider"
import { AuthProvider } from "@/components/auth/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Silsilat - Shariah-Compliant Jewelry Financing",
  description:
    "Revolutionary blockchain-based jewelry financing platform connecting Ar-Rahnu operators with global investors",
  generator: 'v0.app',
  icons: {
    icon: '/images/favicon.jpg',
    shortcut: '/images/favicon.jpg',
    apple: '/images/favicon.jpg',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <LanguageProvider>
              <AuthProvider>
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
                <EnhancedChatWidget />
                <Toaster />
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
