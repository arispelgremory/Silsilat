"use client"

import { useEffect } from 'react'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // const { initializeAuth } = useAuth()

  // useEffect(() => {
  //   // Initialize auth state on app start
  //   initializeAuth()
  // }, [initializeAuth])

  

  return <>{children}</>
}
