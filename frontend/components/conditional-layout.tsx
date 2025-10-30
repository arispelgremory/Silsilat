'use client'

import { usePathname } from 'next/navigation'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Routes that should not show header/footer (full layout pages)
  const fullLayoutRoutes = [
    '/investor',
    '/pawnshop',
    // '/admin',
    // '/ceo'
  ]
  
  // Check if current path starts with any of the full layout routes
  const isFullLayout = fullLayoutRoutes.some(route => pathname.startsWith(route))
  
  if (isFullLayout) {
    // For full layout pages (investor, admin, ceo), render children without header/footer
    return <div className="min-h-screen">{children}</div>
  }
  
  // For regular pages, render with header and footer
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
