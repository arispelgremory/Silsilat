"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/loans"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/loans" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Loans
      </Link>
      <Link
        href="/users"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/users" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Users
      </Link>
      <Link
        href="/auctions"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/auctions" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Auctions
      </Link>
      <Link
        href="/reports"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/reports" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Reports
      </Link>
    </nav>
  )
}
