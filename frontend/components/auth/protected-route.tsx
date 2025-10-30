"use client"

import { useAuth } from '@/hooks/use-auth'
import { UserRole } from '@/lib/auth/auth-service'
import { useAtom } from 'jotai'
import { userAtom } from '@/store/atoms'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  fallback?: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback = null, 
  redirectTo 
}: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const [user] = useAtom(userAtom);
  // const router = useRouter()
  // const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  // console.log("user in protected route", user, requiredRole);

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     const refreshToken = sessionStorage.getItem('refreshToken');

  //     const interval = setInterval(async () => {
  //       const response = await apiInstance.post('/auth/refresh-token', { refreshToken });
  //       if (response.status === 200) {
  //         sessionStorage.setItem('accessToken', response.data.accessToken);
  //         setTokens({
  //           refreshToken: tokens.refreshToken!,
  //           expiredAt: tokens.expiredAt!,
  //           accessToken: response.data.accessToken
  //         });
  //       }
  //     }, 1000 * 60 * 15); // 15 minutes

  //     return () => clearInterval(interval);

  //   }
  // }, [isAuthenticated]);

  // useEffect(() => {
  //   if (isLoading) {
  //     console.log('🔒 ProtectedRoute: Still loading auth state...')
  //     return
  //   }

  //   // Add a small delay on first check to allow login state to settle
  //   if (!hasCheckedAuth) {
  //     const timer = setTimeout(() => {
  //       setHasCheckedAuth(true)
  //     }, 200)
  //     return () => clearTimeout(timer)
  //   }

  //   console.log('🔒 ProtectedRoute check:', {
  //     isAuthenticated,
  //     currentRole: role,
  //     requiredRole,
  //     pathname: window.location.pathname,
  //     hasCheckedAuth
  //   })

  //   if (!isAuthenticated) {
  //     const redirectPath = redirectTo || getRedirectPath(requiredRole)
  //     console.log('🔒 Not authenticated, redirecting to:', redirectPath)
  //     if (redirectPath && redirectPath !== window.location.pathname) {
  //       router.push(redirectPath)
  //     }
  //     return
  //   }

  //   if (requiredRole && role !== requiredRole) {
  //     const redirectPath = redirectTo || getRedirectPath(requiredRole)
  //     console.log('🔒 Role mismatch! Current:', role, 'Required:', requiredRole, 'Redirecting to:', redirectPath)
  //     if (redirectPath && redirectPath !== window.location.pathname) {
  //       router.push(redirectPath)
  //     }
  //     return
  //   }

  //   console.log('🔒 ProtectedRoute: Access granted ✓')
  // }, [isAuthenticated, isLoading, role, requiredRole, redirectTo, getRedirectPath, router, hasCheckedAuth])

  // if (!hasCheckedAuth) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
  //     </div>
  //   )
  // }

  if (!isAuthenticated || !user) {
    return fallback
  }

  const roles = requiredRole?.split(',');

  if (requiredRole && !roles?.includes(user?.userInfo?.roleId || '')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * HOC for protecting pages
 */
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options: {
    requiredRole?: UserRole
    redirectTo?: string
  } = {}
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <ProtectedRoute 
        requiredRole={options.requiredRole}
        redirectTo={options.redirectTo}
      >
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

/**
 * HOC for role-based protection
 */
export function withRole<T extends object>(
  Component: React.ComponentType<T>,
  requiredRole: UserRole
) {
  return withAuth(Component, { requiredRole })
}
