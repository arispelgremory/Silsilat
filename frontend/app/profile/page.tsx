"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserProfileDisplay } from "@/components/auth/user-profile-display"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, User } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user, fetchUserProfile, isLoading } = useAuth()

  const handleRefreshProfile = async () => {
    try {
      await fetchUserProfile()
      toast.success('Profile refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh profile')
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
            <p className="text-muted-foreground">
              View and manage your account information
            </p>
          </div>
          <Button 
            onClick={handleRefreshProfile} 
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Profile
          </Button>
        </div>

        {user ? (
          <UserProfileDisplay 
            showHederaInfo={true} 
            showPersonalInfo={true} 
          />
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading user profile...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
