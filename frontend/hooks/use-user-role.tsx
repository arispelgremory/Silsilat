"use client"

import { useState, useEffect } from "react"

// Define user role types
export type UserRole = "admin" | "ceo" | "loan_officer" | "kyc_officer" | "customer_support" | "user" | null

// Define permission types
export type Permission =
  | "view_statistics"
  | "view_charts"
  | "view_activity"
  | "view_alerts"
  | "manage_loans"
  | "manage_kyc"
  | "manage_users"
  | "manage_settings"
  | "approve_loans"
  | "view_reports"
  | "export_data"
  | "manage_staff"

// Role-based permission mapping
const rolePermissions: Record<string, Permission[]> = {
  admin: [
    "view_statistics",
    "view_charts",
    "view_activity",
    "view_alerts",
    "manage_loans",
    "manage_kyc",
    "manage_users",
    "manage_settings",
    "approve_loans",
    "view_reports",
    "export_data",
    "manage_staff",
  ],
  ceo: [
    "view_statistics",
    "view_charts",
    "view_activity",
    "view_alerts",
    "view_reports",
    "export_data",
    "manage_staff",
  ],
  loan_officer: ["view_statistics", "view_activity", "view_alerts", "manage_loans", "approve_loans"],
  kyc_officer: ["view_statistics", "view_activity", "manage_kyc"],
  customer_support: ["view_activity", "manage_users"],
  user: [],
}

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch the user's role from your auth system
    // This is a simulated implementation for demonstration purposes
    const fetchUserRole = async () => {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Get user role from localStorage (in real app, this could come from a secure HTTP-only cookie or JWT)
        const storedRole = sessionStorage.getItem("userRrole") as UserRole

        // Set a default role for demo if none exists
        const userRole = storedRole || "admin"

        // Store in localStorage for persistence
        localStorage.setItem("user_role", userRole)

        // Set the role and corresponding permissions
        setRole(userRole)
        setPermissions(rolePermissions[userRole] || [])
      } catch (error) {
        console.error("Error fetching user role:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserRole()
  }, [])

  // Function to change user role (for demo/testing purposes)
  const changeRole = (newRole: UserRole) => {
    if (newRole && rolePermissions[newRole]) {
      localStorage.setItem("user_role", newRole)
      setRole(newRole)
      setPermissions(rolePermissions[newRole])
    }
  }

  // Check if user has a specific permission - fixed to handle undefined permissions
  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission)
  }

  return {
    role,
    permissions,
    isLoading,
    changeRole,
    hasPermission,
  }
}
