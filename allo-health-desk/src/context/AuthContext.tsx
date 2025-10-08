'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import axios from '../lib/axios';
import { useRouter } from 'next/navigation';

type User = {
    id: string;
    name: string;
    email: string;
};

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    logout: () => void;
    refreshUser: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const res = await axios.get('/auth/me');
            setUser(res.data);
        } catch (err) {
            setUser(null);
            setError('Failed to fetch user');
            router.push('/');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('/auth/logout');
            setUser(null);
        } catch (err) {
            console.error('Logout failed');
        }
    };

    const refreshUser = () => {
        fetchUser();
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, error, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};