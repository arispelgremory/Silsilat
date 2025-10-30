import apiInstance from '@/lib/axios-v1'

export type UserRole = string;

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  permissions: string[]
  userInfo?: UserProfile
  hederaAccount?: HederaAccount
}

export interface UserProfile {
  userId: string
  userEmail: string
  userContactNo: string
  icNo: string
  icFrontPicture?: string
  icBackPicture?: string
  userFirstName: string
  userLastName: string
  gender: string
  accountId: string
  addressId?: string
  companyId?: string
  vehicleId?: string
  walletId?: string
  userSkillId?: string
  jobReviewId?: string
  roleId: string
  sessionId?: string
  status: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface HederaAccount {
  hederaAccountId: string
  accountInfo: {
    accountId: string
    key: string
    balance: string
    isReceiverSignatureRequired: boolean
    expirationTime: string
    autoRenewPeriod: any
    memo: string
    isDeleted: boolean
    ethereumNonce: string
    stakingInfo: {
      declineStakingReward: boolean
      stakePeriodStart: any
      pendingReward: string
      stakedToMe: string
      stakedAccountId: any
      stakedNodeId: any
    }
  }
  network: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiredAt: number
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    tokens: AuthTokens
  }
}

export class AuthService {
  private static instance: AuthService

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  /**
   * Login with credentials and user type
   */
  async login(credentials: LoginCredentials, userType: UserRole): Promise<AuthResponse> {
    try {
      const response = await apiInstance.post('/auth/login', credentials)
      
      if (response.data.success) {
        // Extract role from response data
        const roleFromResponse = response.data.data.roleName || userType
        
        return {
          success: true,
          data: {
            user: {
              id: '1', // Will be updated when we fetch user profile
              email: credentials.username,
              name: undefined, // Will be updated when we fetch user profile
              role: roleFromResponse as UserRole,
              permissions: this.getRolePermissions(roleFromResponse as UserRole),
              profile: undefined, // Will be fetched separately
              hederaAccount: undefined // Will be fetched separately
            },
            tokens: {
              accessToken: response.data.data.accessToken,
              refreshToken: response.data.data.refreshToken,
              expiredAt: response.data.data.expiredAt
            }
          }
        }
      } else {
        throw new Error('Login failed')
      }
    } catch (error: any) {
      console.error('AuthService login error:', error)
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Clear tokens from storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('suyula-auth-store')
        sessionStorage.clear()
      }
    } catch (error) {
      console.error('AuthService logout error:', error)
    }
  }

  /**
   * Refresh access token
   */
  // async refreshToken(refreshToken: string): Promise<AuthResponse> {
  //   try {
  //     const response = await apiInstance.post('/auth/refresh-token', {}, {
  //       headers: {
  //         'Cookie': `refresh_token=${refreshToken}`
  //       }
  //     })
      
  //     if (response.data && response.data.accessToken) {
  //       // Calculate new expiry time (assuming 1 hour from now)
  //       const expiredAt = new Date().getTime() + (60 * 60 * 1000) // 1 hour
        
  //       return {
  //         success: true,
  //         data: {
  //           user: {} as User, // User will be fetched separately if needed
  //           tokens: {
  //             accessToken: response.data.accessToken,
  //             refreshToken: refreshToken, // Keep the same refresh token
  //             expiredAt: expiredAt
  //           }
  //         }
  //       }
  //     } else {
  //       throw new Error('Token refresh failed')
  //     }
  //   } catch (error: any) {
  //     console.error('AuthService refresh error:', error)
  //     throw new Error('Token refresh failed')
  //   }
  // }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiInstance.get('/auth/user/profile')
      
      if (response.data.success) {
        const userInfo = response.data.data.userInfo
        const hederaAccount = response.data.data.hederaAccount
        
        return {
          id: userInfo.userId,
          email: userInfo.userEmail,
          name: `${userInfo.userFirstName} ${userInfo.userLastName}`,
          role: userInfo.roleId as UserRole,
          permissions: this.getRolePermissions(userInfo.roleId as UserRole),
          profile: {
            userId: userInfo.userId,
            userEmail: userInfo.userEmail,
            userContactNo: userInfo.userContactNo,
            icNo: userInfo.icNo,
            icFrontPicture: userInfo.icFrontPicture,
            icBackPicture: userInfo.icBackPicture,
            userFirstName: userInfo.userFirstName,
            userLastName: userInfo.userLastName,
            gender: userInfo.gender,
            accountId: userInfo.accountId,
            addressId: userInfo.addressId,
            companyId: userInfo.companyId,
            vehicleId: userInfo.vehicleId,
            walletId: userInfo.walletId,
            userSkillId: userInfo.userSkillId,
            jobReviewId: userInfo.jobReviewId,
            roleId: userInfo.roleId,
            sessionId: userInfo.sessionId,
            status: userInfo.status,
            createdAt: userInfo.createdAt,
            updatedAt: userInfo.updatedAt,
            createdBy: userInfo.createdBy,
            updatedBy: userInfo.updatedBy
          },
          hederaAccount: hederaAccount ? {
            hederaAccountId: hederaAccount.hederaAccountId,
            accountInfo: hederaAccount.accountInfo,
            network: hederaAccount.network
          } : undefined
        }
      } else {
        throw new Error('Failed to get user info')
      }
    } catch (error: any) {
      console.error('AuthService getCurrentUser error:', error)
      throw new Error('Failed to get user info')
    }
  }

  /**
   * Validate token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await apiInstance.get('/auth/validate', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data.success
    } catch (error) {
      return false
    }
  }

  /**
   * Get role-based permissions
   */
  private getRolePermissions(role: UserRole): string[] {
    const ROLE_PERMISSIONS = {
      admin: ['*'], // Full access
      investor: [
        'investor:dashboard:read',
        'investor:portfolio:read',
        'investor:browse:read',
        'investor:investments:manage'
      ],
      pawnshop: [
        'pawnshop:dashboard:read',
        'pawnshop:nfts:manage',
        'pawnshop:listings:manage'
      ]
    }

    return ROLE_PERMISSIONS[role] || []
  }
}

export const authService = AuthService.getInstance()
