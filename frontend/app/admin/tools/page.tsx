"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserTable } from "@/components/admin/user-table"
import { CreateUserForm } from "@/components/admin/create-user-form"
import { Settings, Shield, Users, Database, Activity, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: "Ahmad Bin Abdullah",
    email: "ahmad@example.com",
    role: "investor",
    status: "active",
    lastLogin: "2024-01-15",
    kycStatus: "approved",
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    email: "siti@example.com",
    role: "investor",
    status: "active",
    lastLogin: "2024-01-14",
    kycStatus: "approved",
  },
  {
    id: 3,
    name: "Branch Manager KL",
    email: "manager.kl@arrahnu.com",
    role: "branch_manager",
    status: "active",
    lastLogin: "2024-01-15",
    kycStatus: "approved",
  },
  {
    id: 4,
    name: "John Doe",
    email: "john@example.com",
    role: "investor",
    status: "suspended",
    lastLogin: "2024-01-10",
    kycStatus: "pending",
  },
]

export default function AdminToolsPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Tools – User Management</h1>
        <Button onClick={() => setOpen(true)}>New User</Button>
      </div>

      {/* Tools Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{mockUsers.length}</div>
            <div className="text-xs text-gray-500">Platform users</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {mockUsers.filter((u) => u.status === "active").length}
            </div>
            <div className="text-xs text-gray-500">Currently active</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Suspended Users</CardTitle>
            <XCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {mockUsers.filter((u) => u.status === "suspended").length}
            </div>
            <div className="text-xs text-gray-500">Suspended accounts</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending KYC</CardTitle>
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {mockUsers.filter((u) => u.kycStatus === "pending").length}
            </div>
            <div className="text-xs text-gray-500">Awaiting verification</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tools Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Administrative Tools</CardTitle>
          <CardDescription>Manage users, system settings, and platform operations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="system">System Tools</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              {/* Users Table */}
              <UserTable />
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Database Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Backup Database
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Restore Database
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Optimize Database
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      System Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Platform Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Email Configuration
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      API Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Password Policies
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Session Management
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Security Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Failed Login Attempts
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Suspicious Activities
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      IP Blacklist
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Activity Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">User Login</div>
                        <div className="text-sm text-gray-500">admin@silsilat.finance logged in</div>
                      </div>
                      <div className="text-sm text-gray-500">2 minutes ago</div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">SAG Approved</div>
                        <div className="text-sm text-gray-500">SAG #10295 approved by admin</div>
                      </div>
                      <div className="text-sm text-gray-500">15 minutes ago</div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">KYC Verification</div>
                        <div className="text-sm text-gray-500">KYC approved for Ahmad Bin Abdullah</div>
                      </div>
                      <div className="text-sm text-gray-500">1 hour ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ────── Create-User dialog ────── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <CreateUserForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
