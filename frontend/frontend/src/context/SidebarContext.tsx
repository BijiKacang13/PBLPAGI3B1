"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SidebarContextType {
    expanded: boolean;
    setExpanded: (value: boolean) => void;
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [expanded, setExpandedState] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load initial state from localStorage after hydration
    useEffect(() => {
        const saved = localStorage.getItem("sidebar_expanded");
        if (saved !== null) {
            setExpandedState(saved === "true");
        }
        setIsHydrated(true);
    }, []);

    const setExpanded = (value: boolean) => {
        setExpandedState(value);
        localStorage.setItem("sidebar_expanded", String(value));
    };

    const toggleSidebar = () => {
        setExpanded(!expanded);
    };

    return (
        <SidebarContext.Provider value={{ expanded, setExpanded, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
