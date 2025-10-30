"use client"

import { Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserRole } from "@/hooks/use-user-role"
import { useRouter } from "next/navigation"
import { useAtom } from "jotai"
import { userAtom } from "@/store/atoms"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { useEffect } from "react"

export function AdminHeader() {
  const [user] = useAtom(userAtom)
  const role = user?.userInfo?.roleId as string
  const router = useRouter()
  const { logout } = useAuth()
  
  const handleLogout = async () => {
    const promise = logout()
    toast.promise(promise, {
      loading: 'Logging out...',
      success: () => 'Logged out successfully',
      error: 'Failed to log out',
    })
  }

  return (
    <header className="h-16 px-6 flex items-center justify-between bg-white">
      {/* Left side - Title and Role */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
        <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
          {role?.toUpperCase() || "ADMIN"}
        </Badge>
      </div>

      {/* Right side - Search, Notifications, User */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search SAGs, investors, branches..." className="w-80 pl-10 bg-gray-50 border-gray-200" />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
            3
          </Badge>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">admin@silsilat.finance</p>
                <p className="text-xs leading-none text-muted-foreground">Role: {role === 'pawnshop' ? 'Ar Rahnu' : role}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
