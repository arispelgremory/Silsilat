"use client"

import { LogOut, Settings, User, UserCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User as UserType, UserRole } from "@/lib/auth/auth-service"

interface UserNavProps {
  user: UserType | null
  role: UserRole
  onLogout: () => void
}

export function UserNav({ user, role, onLogout }: UserNavProps) {
  const router = useRouter()

  const handleLogout = () => {
    onLogout()
    router.push('/')
  }

  const getDashboardPath = () => {
    switch (role) {
      case 'admin':
      case 'pawnshop':
        return '/admin/dashboard'
      case 'investor':
        return '/dashboard' // Main dashboard is for investors
      default:
        return '/dashboard'
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt={role || 'User'} />
            <AvatarFallback>{role?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.userInfo?.userFirstName + ' ' + user?.userInfo?.userLastName || role || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">{user?.userInfo?.userEmail || 'user@silsilat.finance'}</p>
            <p className="text-xs leading-none text-muted-foreground">{role === 'pawnshop' ? 'Ar Rahnu' : role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={getDashboardPath()}>
              <User className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
