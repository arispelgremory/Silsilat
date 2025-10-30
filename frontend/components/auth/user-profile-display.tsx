"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { User, UserProfile, HederaAccount } from "@/lib/auth/auth-service"

interface UserProfileDisplayProps {
  showHederaInfo?: boolean
  showPersonalInfo?: boolean
}

export function UserProfileDisplay({ 
  showHederaInfo = true, 
  showPersonalInfo = true 
}: UserProfileDisplayProps) {
  const { user } = useAuth()

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No user information available</p>
        </CardContent>
      </Card>
    )
  }

  const profile = user.profile
  const hederaAccount = user.hederaAccount

  return (
    <div className="space-y-4">
      {/* Basic User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>User Information</span>
            <Badge variant="outline">{user.role}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-sm">{user.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
              <p className="text-sm font-mono text-xs">{user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={profile?.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {profile?.status || 'Unknown'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      {showPersonalInfo && profile && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">First Name</p>
                <p className="text-sm">{profile.userFirstName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                <p className="text-sm">{profile.userLastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                <p className="text-sm">{profile.userContactNo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">IC Number</p>
                <p className="text-sm font-mono text-xs">{profile.icNo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p className="text-sm">{profile.gender}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account ID</p>
                <p className="text-sm font-mono text-xs">{profile.accountId}</p>
              </div>
            </div>
            
            {profile.walletId && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wallet ID</p>
                <p className="text-sm font-mono text-xs">{profile.walletId}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hedera Account Information */}
      {showHederaInfo && hederaAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Hedera Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account ID</p>
                <p className="text-sm font-mono text-xs">{hederaAccount.hederaAccountId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network</p>
                <Badge variant="outline">{hederaAccount.network}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Balance</p>
                <p className="text-sm">{hederaAccount.accountInfo.balance}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={hederaAccount.accountInfo.isDeleted ? 'destructive' : 'default'}>
                  {hederaAccount.accountInfo.isDeleted ? 'Deleted' : 'Active'}
                </Badge>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Public Key</p>
              <p className="text-sm font-mono text-xs break-all">{hederaAccount.accountInfo.key}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expiration Time</p>
              <p className="text-sm">
                {new Date(parseInt(hederaAccount.accountInfo.expirationTime) * 1000).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Creation Info */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                <p className="text-sm">{new Date(profile.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                <p className="text-sm">{new Date(profile.updatedAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created By</p>
                <p className="text-sm">{profile.createdBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Updated By</p>
                <p className="text-sm">{profile.updatedBy}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
