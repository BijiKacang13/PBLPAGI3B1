"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserContextType {
    displayName: string;
    isLoading: boolean;
    clearUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}

export function UserProvider({ children }: { children: ReactNode }) {
    const [displayName, setDisplayName] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Load initial state from localStorage
        if (typeof window !== "undefined") {
            const userDataStr = localStorage.getItem("user_data");
            if (userDataStr) {
                try {
                    const userData = JSON.parse(userDataStr);
                    // Prioritize name, then username, then email
                    setDisplayName(userData.name || userData.username || userData.email || "Pengguna");
                } catch (e) {
                    console.error("Error parsing user_data from localStorage:", e);
                }
            }
        }
        setIsLoading(false);
    }, []);

    const clearUserData = () => {
        setDisplayName("");
    };

    return (
        <UserContext.Provider value={{ displayName, isLoading, clearUserData }}>
            {children}
        </UserContext.Provider>
    );
}
