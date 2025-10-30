"use client"

import type React from "react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof document === "undefined") return
    document.body.classList.add("admin-page")
    return () => document.body.classList.remove("admin-page")
  }, [])

  // Let the login screen render without the admin shell and auth guard
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Full admin shell with auth protection
  return (
    <ProtectedRoute requiredRole="admin,pawnshop">
      <div className="flex h-screen w-full overflow-hidden bg-gray-50">
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white">
          <ScrollArea className="h-full">
            <AdminSidebar />
          </ScrollArea>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="border-b border-gray-200 bg-white">
            <AdminHeader />
          </header>

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
