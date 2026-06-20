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

            const token = localStorage.getItem("access_token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                await refreshUser();
            } finally {
                setLoading(false);
            }
        }

        init();
    }, []);


    async function login(tokenData) {

        localStorage.setItem("access_token", tokenData.access_token);
        localStorage.setItem("refresh_token", tokenData.refresh_token);

        await refreshUser();
    }



    async function logout() {
        try {
            const refreshToken = localStorage.getItem("refresh_token");

            if (refreshToken) {
                await logoutService();
            }
        } catch (err) {
            console.error(err);
        } finally {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setUser(null);
        }
    }

    const value = {
        user,
        loading,
        isAuthenticated,

        login,
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