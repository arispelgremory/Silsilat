'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { authenticateUser as serverAuthenticate, logoutUser } from '@/lib/auth/auth-actions';
import { useSetAtom } from 'jotai';
import { userAtom } from '@/store/atoms';
import { User } from '@/lib/auth/auth-service';
import { renewToken } from '@/services/refresh-token';

interface AuthState {
    isAuthenticated: boolean;
    token?: string;
    userType?: string;
    refreshToken?: string;
}

export function useAuth() {
    const router = useRouter();
    const setUser = useSetAtom(userAtom);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const {
        value: auth,
        setValue: setAuth,
        removeValue: removeAuth
    } = useLocalStorage<AuthState>('authState');

    const authenticateUser = useCallback(async (credentials: { email: string; password: string }) => {
        try {
            setError(""); // Clear any previous errors
            setIsLoading(true);
            const result = await serverAuthenticate(credentials);

            if (result.success && 'data' in result && 'token' in result) {
                setAuth({ 
                    isAuthenticated: true,
                    token: result.token,
                    userType: result.userType,
                    refreshToken: result.refreshToken,
                });
                setUser(result.data as User);
                setIsLoading(false);
                return { success: true };
            } else {
                const errorMessage = result.error || 'Authentication failed';
                setError(errorMessage);
                setIsLoading(false);
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    }, [setAuth, setUser, router, setIsLoading]);

    const logout = useCallback(async () => {
        try {
            await logoutUser();
            removeAuth();
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
            removeAuth();
            setUser(null);
            router.push('/');
        }
    }, [removeAuth, setUser, router]);

    const refreshAuthToken = useCallback(async () => {
        try {
          // Read directly from localStorage to avoid stale state issues
          const storedAuth = localStorage.getItem('authState');
          const authData = storedAuth ? JSON.parse(storedAuth) : null;
          const refreshToken = authData?.refreshToken;

          console.log("Refresh token:", refreshToken, "authData:", authData, "storedAuth:", storedAuth)

          if (!authData) {
            throw new Error('No refreshToken found');
          }

          const result = await renewToken(refreshToken);
          if (!result) {
            throw new Error('Failed to refresh token');
          }
          setAuth({
            isAuthenticated: true,
            token: result.accessToken,
            userType: result.roleName,
            refreshToken: result.refreshToken,
          });
          return { success: true };
        } catch (error) {
            console.error('Refresh token error:', error);
        } finally {
          setIsLoading(false);
        }
    }, [setAuth, setIsLoading]);

    return {
        isLoading,
        isAuthenticated: auth?.isAuthenticated ?? false,
        token: auth?.token,
        authenticateUser,
        refreshAuthToken,
        error,
        logout,
    };
}