import { User, UserRole } from '@/lib/auth/auth-service';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const accessTokenAtom = atom<string | null>(null);
export const refreshTokenAtom = atom<string | null>(null);
export const tokenExpiredAtAtom = atom<string | null>(null);

type AuthState = {
    user: User | null;
    role: UserRole | null;
    isAuthenticated: boolean;
    isLoading: boolean;
};

const authStateAtom = atomWithStorage<AuthState>("authStorage", {
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: false,
});

export const userAtom = atom(
    (get) => get(authStateAtom).user,
    (get, set, user: User | null) => set(authStateAtom, { ...get(authStateAtom), user })
);