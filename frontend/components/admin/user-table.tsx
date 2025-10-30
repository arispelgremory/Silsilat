"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface User {
  id: string
  name: string
  email: string
  role: string
  phone: string
  status: "active" | "suspended" | "inactive"
  kycStatus: "pending" | "approved" | "rejected"
  createdAt: string
}

export function UserTable() {
  const { t } = useLanguage()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Load users from localStorage
    const savedUsers = JSON.parse(localStorage.getItem("users") || "[]")

    // Add some demo users if none exist
    if (savedUsers.length === 0) {
      const demoUsers: User[] = [
        {
          id: "1",
          name: "Ahmad Bin Abdullah",
          email: "ahmad@example.com",
          role: "investor",
          phone: "+60123456789",
          status: "active",
          kycStatus: "approved",
          createdAt: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          name: "Siti Nurhaliza",
          email: "siti@example.com",
          role: "branch_manager",
          phone: "+60198765432",
          status: "active",
          kycStatus: "approved",
          createdAt: "2024-01-20T14:15:00Z",
        },
        {
          id: "3",
          name: "Raj Kumar",
          email: "raj@example.com",
          role: "investor",
          phone: "+60187654321",
          status: "suspended",
          kycStatus: "pending",
          createdAt: "2024-02-01T09:45:00Z",
        },
      ]
      localStorage.setItem("users", JSON.stringify(demoUsers))
      setUsers(demoUsers)
    } else {
      setUsers(savedUsers)
    }
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const updateUserStatus = (userId: string, newStatus: User["status"]) => {
    const updatedUsers = users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user))
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter((user) => user.id !== userId)
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "suspended":
        return <Badge className="bg-yellow-100 text-yellow-800">Suspended</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getKycBadge = (status: User["kycStatus"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "investor":
        return "Investor"
      case "branch_manager":
        return "Branch Manager"
      case "admin":
        return "Admin"
      case "compliance":
        return "Compliance Officer"
      default:
        return role
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>KYC Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleDisplay(user.role)}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>{getKycBadge(user.kycStatus)}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => console.log("View user", user.id)}>
                        {t("common.view")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => console.log("Edit user", user.id)}>
                        {t("common.edit")}
                      </DropdownMenuItem>
                      {user.status === "active" ? (
                        <DropdownMenuItem onClick={() => updateUserStatus(user.id, "suspended")}>
                          Suspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => updateUserStatus(user.id, "active")}>
                          Activate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600" onClick={() => deleteUser(user.id)}>
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
