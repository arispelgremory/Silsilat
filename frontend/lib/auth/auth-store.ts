import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authService, User, UserRole, LoginCredentials, AuthTokens } from './auth-service'

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  role: UserRole | null
  tokens: {
    accessToken: string | null
    refreshToken: string | null
    expiredAt: number | null
  }
  error: string | null
}

export interface AuthActions {
  login: (credentials: LoginCredentials, userType: UserRole) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<boolean>
  setUser: (user: User) => void
  setTokens: (tokens: AuthTokens) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  hasRole: (role: UserRole) => boolean
  hasPermission: (permission: string) => boolean
  initializeAuth: () => Promise<void>
  clearError: () => void
  fetchUserProfile: () => Promise<void>
}

export interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      isLoading: false,
      user: null,
      role: null,
      tokens: {
        accessToken: null,
        refreshToken: null,
        expiredAt: null
      },
      error: null,

      // Actions
      login: async (credentials, userType) => {
        try {
          set({ isLoading: true, error: null })

          console.log("trying to login?")
          
          console.log("loggin in", credentials, userType)
          const response = await authService.login(credentials, userType)
          
          if (response.success) {
            // Store the intended user type for role preservation
            const intendedRole = userType
            
            set({
              isAuthenticated: true,
              user: response.data.user,
              role: intendedRole, // Use intended role, not API response
              tokens: response.data.tokens,
              isLoading: false,
              error: null
            })

            sessionStorage.setItem("accessToken", response.data.tokens.accessToken);
            sessionStorage.setItem("refreshToken", response.data.tokens.refreshToken);
            sessionStorage.setItem("expiredAt", response.data.tokens.expiredAt.toString());
            sessionStorage.setItem("userType", intendedRole); // Store intended role
            
            // Fetch full user profile after successful login
            try {
              await get().fetchUserProfile()
              // Restore the intended role after profile fetch (in case it was overwritten)
              set({ role: intendedRole })
            } catch (profileError) {
              console.warn('Failed to fetch user profile:', profileError)
              // Don't fail login if profile fetch fails
            }
          } else {
            set({
              isAuthenticated: false,
              user: null,
              role: null,
              tokens: { accessToken: null, refreshToken: null, expiredAt: null },
              isLoading: false,
              error: 'Login failed'
            })
          }
        } catch (error: any) {
          set({
            isAuthenticated: false,
            user: null,
            role: null,
            tokens: { accessToken: null, refreshToken: null, expiredAt: null },
            isLoading: false,
            error: error.message || 'Login failed'
          })
        }
      },

      logout: () => {
        authService.logout()
        // Clear session storage
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('refreshToken')
        sessionStorage.removeItem('expiredAt')
        sessionStorage.removeItem('userType')
        set({
          isAuthenticated: false,
          user: null,
          role: null,
          tokens: { accessToken: null, refreshToken: null, expiredAt: null },
          isLoading: false,
          error: null
        })
      },

      refreshToken: async () => {
        // try {
        //   const { tokens } = get()
        //   if (!tokens.refreshToken) {
        //     return false
        //   }

        //   const response = await authService.refreshToken(tokens.refreshToken)
          
        //   if (response.success) {
        //     // Only update tokens, keep existing user data
        //     set({
        //       tokens: response.data.tokens,
        //       error: null
        //     })
            
        //     // Update session storage with new tokens
        //     sessionStorage.setItem('accessToken', response.data.tokens.accessToken)
        //     sessionStorage.setItem('refreshToken', response.data.tokens.refreshToken)
        //     sessionStorage.setItem('expiredAt', response.data.tokens.expiredAt.toString())
            
        //     return true
        //   } else {
        //     get().logout()
        //     return false
        //   }
        // } catch (error) {
        //   console.error('Token refresh failed:', error)
        //   get().logout()
        //   return false
        // }
        return true
      },

      setUser: (user) => {
        set({ user })
      },

      setTokens: (tokens) => {
        set({ tokens })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      fetchUserProfile: async () => {
        try {
          const user = await authService.getCurrentUser()
          set({ user })
        } catch (error: any) {
          console.error('Failed to fetch user profile:', error)
          set({ error: error.message || 'Failed to fetch user profile' })
        }
      },

      hasRole: (role) => {
        const { role: currentRole } = get()
        return currentRole === role
      },

      hasPermission: (permission) => {
        const { user, role } = get()
        
        if (!user || !role) return false
        
        // Admin has all permissions
        if (role === 'admin') return true
        
        // Check user permissions
        return user.permissions.includes(permission) || user.permissions.includes('*')
      },

      initializeAuth: async () => {
        try {
          set({ isLoading: true })
          
          let { tokens, isAuthenticated, user } = get()
          
          console.log('🔐 Auth initialization started', {
            isAuthenticated,
            hasTokensInStore: !!tokens.accessToken,
            hasUser: !!user
          })
          
          // Check sessionStorage for tokens if not authenticated in store
          if (!isAuthenticated || !tokens.accessToken) {
            const sessionAccessToken = sessionStorage.getItem('accessToken')
            const sessionRefreshToken = sessionStorage.getItem('refreshToken')
            const sessionExpiredAt = sessionStorage.getItem('expiredAt')
            
            console.log('🔐 Checking sessionStorage for tokens', {
              hasSessionAccessToken: !!sessionAccessToken,
              hasSessionRefreshToken: !!sessionRefreshToken,
              hasSessionExpiredAt: !!sessionExpiredAt
            })
            
            // If tokens exist in sessionStorage, restore them to the store
            if (sessionAccessToken && sessionRefreshToken && sessionExpiredAt) {
              const restoredTokens = {
                accessToken: sessionAccessToken,
                refreshToken: sessionRefreshToken,
                expiredAt: parseInt(sessionExpiredAt)
              }
              
              // Check if token is expired before restoring
              const currentTime = new Date().getTime()
              const isTokenExpired = currentTime >= restoredTokens.expiredAt
              
              console.log('🔐 Token status', {
                isExpired: isTokenExpired,
                expiryTime: new Date(restoredTokens.expiredAt).toISOString(),
                currentTime: new Date(currentTime).toISOString()
              })
              
              if (isTokenExpired) {
                // Token expired, try to refresh immediately
                console.log('🔐 Token expired, attempting refresh...')
                set({ tokens: restoredTokens })
                const refreshSuccess = await get().refreshToken()
                if (!refreshSuccess) {
                  console.log('🔐 Token refresh failed, clearing session')
                  // Clear session storage on failed refresh
                  sessionStorage.removeItem('accessToken')
                  sessionStorage.removeItem('refreshToken')
                  sessionStorage.removeItem('expiredAt')
                  set({ isLoading: false })
                  return
                }
                console.log('🔐 Token refreshed successfully')
                // Token refreshed successfully, continue with updated tokens
                tokens = get().tokens
              } else {
                // Token still valid, restore it
                console.log('🔐 Restoring valid token from sessionStorage')
                set({ 
                  tokens: restoredTokens,
                  isAuthenticated: true
                })
              }
              
              // Try to fetch user profile with the restored/refreshed token
              console.log('🔐 Fetching user profile...')
              try {
                await get().fetchUserProfile()
                const updatedUser = get().user
                const storedUserType = sessionStorage.getItem('userType') as UserRole | null
                if (updatedUser) {
                  console.log('🔐 User profile fetched successfully', {
                    userId: updatedUser.id,
                    userRole: updatedUser.role,
                    storedUserType
                  })
                  // Use stored userType if available, otherwise fall back to user role from profile
                  const roleToUse = storedUserType || updatedUser.role
                  set({ 
                    role: roleToUse,
                    isAuthenticated: true
                  })
                } else {
                  console.warn('🔐 User profile fetch returned null')
                }
              } catch (error: any) {
                console.error('🔐 Failed to fetch user profile:', error)
                
                // Only clear session if it's an authentication error (401)
                if (error.response?.status === 401 || error.message?.includes('401')) {
                  console.log('🔐 Authentication error (401), clearing session')
                  sessionStorage.removeItem('accessToken')
                  sessionStorage.removeItem('refreshToken')
                  sessionStorage.removeItem('expiredAt')
                  get().logout()
                  set({ isLoading: false })
                  return
                }
                
                // For other errors, keep trying - don't immediately mark as unauthenticated
                console.log('🔐 Non-auth error, keeping session but setting error state')
                set({ 
                  error: 'Failed to load user profile. Please refresh the page.'
                })
              }
              
              // Update tokens reference after restoration
              tokens = get().tokens
              isAuthenticated = get().isAuthenticated
            } else {
              console.log('🔐 No tokens found in sessionStorage')
              set({ isLoading: false })
              return
            }
          } else {
            console.log('🔐 Already authenticated from store')
          }

          // If we have a user but token is expired, try to refresh
          if (isAuthenticated && tokens.expiredAt) {
            const expiryTime = tokens.expiredAt
            const currentTime = new Date().getTime()
            
            if (currentTime >= expiryTime) {
              console.log('🔐 Token expired, attempting refresh...')
              // Token expired, try to refresh
              const refreshSuccess = await get().refreshToken()
              if (!refreshSuccess) {
                console.log('🔐 Token refresh failed, logging out')
                // Clear session storage on failed refresh
                sessionStorage.removeItem('accessToken')
                sessionStorage.removeItem('refreshToken')
                sessionStorage.removeItem('expiredAt')
                get().logout()
              } else {
                console.log('🔐 Token refreshed successfully')
              }
            }
          }

          const finalState = get()
          console.log('🔐 Auth initialization completed', {
            isAuthenticated: finalState.isAuthenticated,
            hasUser: !!finalState.user,
            role: finalState.role
          })

          set({ isLoading: false })
        } catch (error) {
          console.error('🔐 Auth initialization failed:', error)
          set({ 
            isLoading: false,
            error: 'Authentication initialization failed'
          })
        }
      }
    }),
    {
      name: 'suyula-auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        role: state.role,
        tokens: state.tokens
      })
    }
  )
)
