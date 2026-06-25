"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "@/services/user.service";
import { logout as logoutService } from "@/services/auth.service";


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const isAuthenticated = !!user;



    const refreshUser = async () => {
        try {
            const user = await getCurrentUser();

            setUser(user);
        } catch {
            setUser(null);
        }
    };



    useEffect(() => {
        async function init() {
            try {
                await refreshUser();
            } finally {
                setLoading(false);
            }
        }

        init();
    }, []);



    async function logout() {
        try {
            await logoutService();
        } catch (err) {
            console.error(err);
        } finally {
            setUser(null);
        }
    }

    const value = {
        user,
        loading,
        isAuthenticated,
        logout,
        refreshUser
    };

    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}