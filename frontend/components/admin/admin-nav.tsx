"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/admin/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/admin/dashboard" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/admin/loans"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/admin/loans" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Loans
      </Link>
      <Link
        href="/admin/users"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/admin/users" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Users
      </Link>
      <Link
        href="/admin/kyc"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/admin/kyc" ? "text-primary" : "text-muted-foreground",
        )}
      >
        KYC Verification
      </Link>
      <Link
        href="/admin/nfts"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/admin/nfts" ? "text-primary" : "text-muted-foreground",
        )}
      >
        NFT Management
      </Link>
    </nav>
  )
}
