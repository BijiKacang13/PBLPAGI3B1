"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import SessionExpiredAlert from "@/components/SessionExpiredAlert";

interface SessionContextType {
    showSessionExpired: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
}

interface SessionProviderProps {
    children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
    const [showAlert, setShowAlert] = useState(false);

    const showSessionExpired = useCallback(() => {
        // Clear all auth data
        if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            localStorage.removeItem("user_role");
            localStorage.removeItem("user_unit_id");
            localStorage.removeItem("user_unit_name");
            localStorage.removeItem("session_expires_in");
            localStorage.removeItem("remember_me");
        }

        setShowAlert(true);
    }, []);

    // Listen for session-expired event from axiosClient or other sources
    useEffect(() => {
        const handleSessionExpired = () => {
            setShowAlert(true);
        };

        window.addEventListener("session-expired", handleSessionExpired);

        return () => {
            window.removeEventListener("session-expired", handleSessionExpired);
        };
    }, []);

    const handleClose = useCallback(() => {
        setShowAlert(false);
        // Redirect to login after alert closes
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
    }, []);

    return (
        <SessionContext.Provider value={{ showSessionExpired }}>
            {children}
            <SessionExpiredAlert
                show={showAlert}
                onClose={handleClose}
                autoCloseMs={2500}
            />
        </SessionContext.Provider>
    );
}
