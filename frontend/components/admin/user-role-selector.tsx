"use client"

import { Button } from "@/components/ui/button"
import { useUserRole, type UserRole } from "@/hooks/use-user-role"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export function UserRoleSelector() {
  const { role, changeRole } = useUserRole()

  const availableRoles: { role: UserRole; label: string }[] = [
    { role: "admin", label: "Admin" },
    { role: "ceo", label: "CEO" },
    { role: "loan_officer", label: "Loan Officer" },
    { role: "kyc_officer", label: "KYC Officer" },
    { role: "customer_support", label: "Customer Support" },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full">
          <span>Current Role: {role}</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Switch User Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableRoles.map((roleOption) => (
          <DropdownMenuItem
            key={roleOption.role}
            onClick={() => changeRole(roleOption.role)}
            className={role === roleOption.role ? "bg-muted" : ""}
          >
            {roleOption.label}
            {role === roleOption.role && <span className="ml-2 text-xs">(current)</span>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs text-muted-foreground">For demonstration purposes only</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
