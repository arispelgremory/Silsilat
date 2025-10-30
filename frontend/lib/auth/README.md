# Authentication System Documentation

## Overview

This authentication system provides a centralized, Zustand-based solution for handling authentication across the Suyula Liquid application. It supports multiple user roles (admin, investor, pawnshop, user), persistent sessions, and seamless navigation.

## Architecture

### Core Components

1. **AuthService** (`auth-service.ts`) - Handles all authentication API calls
2. **AuthStore** (`auth-store.ts`) - Zustand store for auth state management
3. **Auth Hooks** (`use-auth.ts`) - Custom hooks for accessing auth functionality
4. **ProtectedRoute** (`protected-route.tsx`) - HOC for route protection
5. **AuthProvider** (`auth-provider.tsx`) - Context provider for auth initialization

## Usage

### Basic Authentication

```typescript
import { useAuth } from '@/hooks/use-auth'

function LoginComponent() {
  const { login, logout, isAuthenticated, user, isLoading } = useAuth()

  const handleLogin = async (credentials) => {
    try {
      await login(credentials, 'user')
      // User is now logged in
    } catch (error) {
      // Handle login error
    }
  }

  return (
    <div>
      {isAuthenticated ? (
        <div>Welcome, {user?.email}!</div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  )
}
```

### Role-Based Access Control

```typescript
import { useHasRole, useHasPermission } from '@/hooks/use-auth'

function AdminPanel() {
  const isAdmin = useHasRole('admin')
  const canManageUsers = useHasPermission('admin:users:manage')

  if (!isAdmin) {
    return <div>Access Denied</div>
  }

  return <div>Admin Panel</div>
}
```

### Protected Routes

```typescript
import { ProtectedRoute } from '@/components/auth/protected-route'

function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin Dashboard Content</div>
    </ProtectedRoute>
  )
}
```

### HOC for Page Protection

```typescript
import { withAuth, withRole } from '@/components/auth/protected-route'

// Protect any page
const ProtectedPage = withAuth(MyPage)

// Protect with specific role
const AdminPage = withRole(MyPage, 'admin')
```

## API Reference

### AuthService

```typescript
class AuthService {
  // Login with credentials and user type
  async login(credentials: LoginCredentials, userType: UserRole): Promise<AuthResponse>
  
  // Logout user
  async logout(): Promise<void>
  
  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthResponse>
  
  // Get current user information
  async getCurrentUser(): Promise<User>
  
  // Validate token
  async validateToken(token: string): Promise<boolean>
}
```

### AuthStore

```typescript
interface AuthStore {
  // State
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  role: UserRole | null
  tokens: AuthTokens
  error: string | null

  // Actions
  login: (credentials: LoginCredentials, userType: UserRole) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<boolean>
  setUser: (user: User) => void
  setTokens: (tokens: AuthTokens) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  hasRole: (role: UserRole) => boolean
  hasPermission: (permission: string) => boolean
  initializeAuth: () => Promise<void>
}
```

### Auth Hooks

```typescript
// Main auth hook
const { isAuthenticated, user, role, login, logout } = useAuth()

// Auth actions only
const { login, logout, refreshToken } = useAuthActions()

// Role checking
const isAdmin = useHasRole('admin')

// Permission checking
const canManageUsers = useHasPermission('admin:users:manage')

// Require auth for components
const { isAuthenticated, isLoading, user, role, isReady } = useRequireAuth()

// Auth redirect logic
const { isAuthenticated, role, isLoading, getRedirectPath } = useAuthRedirect()
```

## User Roles and Permissions

### Roles

- **admin**: Full platform access
- **investor**: Investment portfolio management (main dashboard users)
- **pawnshop**: Pawnshop operations

### Permissions

```typescript
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
```

## Route Protection

### Protected Routes Configuration

```typescript
const PROTECTED_ROUTES = {
  '/admin': { roles: ['admin'], redirect: '/admin/login' },
  '/investor': { roles: ['investor'], redirect: '/login' },
  '/pawnshop': { roles: ['pawnshop'], redirect: '/pawnshop/login' },
  '/dashboard': { roles: ['investor'], redirect: '/login' }
}
```

### Usage Examples

```typescript
// Protect entire page
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>

// Protect with custom redirect
<ProtectedRoute requiredRole="investor" redirectTo="/investor/login">
  <InvestorDashboard />
</ProtectedRoute>

// HOC approach
const ProtectedAdminPage = withRole(AdminPage, 'admin')
```

## Token Management

### Automatic Token Refresh

The system automatically handles token refresh:

- Tokens are validated on app initialization
- Expired tokens trigger automatic refresh
- Failed refresh attempts log out the user
- Background refresh during user activity

### Storage Strategy

- **Zustand Persistence**: Using Zustand's persist middleware with localStorage
- **Storage Key**: `suyula-auth-store`
- **Selective Persistence**: Only essential auth data is persisted
- **Automatic Hydration**: State is restored on app initialization

## Error Handling

### Error Types

1. **Network Errors**: Connection issues, timeouts
2. **Credential Errors**: Invalid username/password
3. **Token Errors**: Expired, invalid, or malformed tokens
4. **Permission Errors**: Insufficient role permissions
5. **Server Errors**: 5xx responses from authentication endpoints

### Error Handling Strategy

- **Graceful Degradation**: Maintain app functionality when possible
- **User-Friendly Messages**: Clear, actionable error messages
- **Automatic Recovery**: Auto-retry for network errors
- **Secure Fallbacks**: Safe defaults for permission checks

## Integration Examples

### Login Page Integration

```typescript
// Before (manual state management)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

const handleLogin = async (credentials) => {
  setLoading(true)
  try {
    const response = await api.post('/auth/login', credentials)
    sessionStorage.setItem('token', response.data.token)
    router.push('/dashboard')
  } catch (error) {
    setError(error.message)
  } finally {
    setLoading(false)
  }
}

// After (with auth store)
const { login, isLoading, error } = useAuth()

const handleLogin = async (credentials) => {
  try {
    await login(credentials, 'user')
    router.push('/dashboard')
  } catch (error) {
    // Error is handled by the store
  }
}
```

### Navigation Integration

```typescript
// Header component with auth state
function Header() {
  const { isAuthenticated, user, role, logout } = useAuth()

  return (
    <header>
      {isAuthenticated ? (
        <UserNav user={user} role={role} onLogout={logout} />
      ) : (
        <LoginButton />
      )}
    </header>
  )
}
```

## Testing

### Unit Testing

```typescript
// Test auth store actions
import { useAuthStore } from '@/lib/auth/auth-store'

test('login action updates state correctly', () => {
  const store = useAuthStore.getState()
  store.login(mockCredentials, 'user')
  
  expect(store.isAuthenticated).toBe(true)
  expect(store.user).toBeDefined()
  expect(store.role).toBe('user')
})
```

### Integration Testing

```typescript
// Test complete auth flow
test('user can login and access protected route', async () => {
  render(<App />)
  
  // Login
  fireEvent.click(screen.getByText('Login'))
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@test.com' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } })
  fireEvent.click(screen.getByText('Sign In'))
  
  // Should redirect to dashboard
  await waitFor(() => {
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
```

## Security Considerations

1. **Token Security**: Tokens are stored securely in localStorage with Zustand persistence
2. **XSS Protection**: User data is safely handled and displayed
3. **CSRF Protection**: Request validation and proper headers
4. **Session Management**: Proper cleanup and expiry handling
5. **Role Validation**: Server-side role validation for sensitive operations

## Migration Guide

### From Manual Auth to Zustand Auth

1. **Replace manual state management**:
   ```typescript
   // Before
   const [isAuthenticated, setIsAuthenticated] = useState(false)
   const [user, setUser] = useState(null)
   
   // After
   const { isAuthenticated, user } = useAuth()
   ```

2. **Replace manual API calls**:
   ```typescript
   // Before
   const response = await api.post('/auth/login', credentials)
   sessionStorage.setItem('token', response.data.token)
   
   // After
   await login(credentials, 'user')
   ```

3. **Replace manual route protection**:
   ```typescript
   // Before
   useEffect(() => {
     if (!isAuthenticated) {
       router.push('/login')
     }
   }, [isAuthenticated])
   
   // After
   <ProtectedRoute requiredRole="user">
     <Dashboard />
   </ProtectedRoute>
   ```

## Troubleshooting

### Common Issues

1. **Hydration Mismatch**: Ensure AuthProvider wraps the app
2. **Token Expiry**: Check token refresh logic
3. **Role Mismatch**: Verify role assignment in login
4. **Storage Issues**: Check localStorage availability

### Debug Tools

```typescript
// Enable Zustand devtools
import { devtools } from 'zustand/middleware'

const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // store implementation
      }),
      { name: 'suyula-auth-store' }
    )
  )
)
```

## Performance Considerations

1. **Selective Subscriptions**: Use specific selectors to avoid unnecessary re-renders
2. **Lazy Loading**: Load auth state only when needed
3. **Memoization**: Use React.memo for components that depend on auth state
4. **Background Refresh**: Implement efficient token refresh strategies

## Future Enhancements

1. **Multi-Factor Authentication**: Add MFA support
2. **Social Login**: Integrate OAuth providers
3. **Session Management**: Advanced session handling
4. **Audit Logging**: Comprehensive auth event logging
5. **Biometric Authentication**: Add biometric support for mobile
