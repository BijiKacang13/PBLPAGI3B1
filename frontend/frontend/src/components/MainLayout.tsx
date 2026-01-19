"use client";

import { useState, useEffect, ReactNode } from "react";
import Navbar from "@/components/Navbar";
import NavbarBottom from "@/components/NavbarBottom";
import Sidebar from "@/components/Sidebar";

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load initial state from localStorage after hydration
    useEffect(() => {
        const saved = localStorage.getItem("sidebar_expanded");
        if (saved !== null) {
            setSidebarExpanded(saved === "true");
        }
        setIsHydrated(true);
    }, []);

    const toggleSidebar = () => {
        const newValue = !sidebarExpanded;
        setSidebarExpanded(newValue);
        localStorage.setItem("sidebar_expanded", String(newValue));
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
            <Navbar />

            {/* Sidebar - only visible on lg screens */}
            <Sidebar expanded={sidebarExpanded} onToggle={toggleSidebar} />

            {/* Main Content - adjusts based on sidebar width */}
            <main
                className={`flex-1 pt-[90px] pb-20 lg:pb-6 transition-all duration-300 ${isHydrated
                        ? (sidebarExpanded ? "lg:ml-64" : "lg:ml-20")
                        : "lg:ml-64"
                    }`}
            >
                <div className="px-4 md:px-6 lg:px-8 py-6">
                    {children}
                </div>
            </main>

            {/* NavbarBottom - only visible on mobile/tablet */}
            <NavbarBottom />
        </div>
    );
}
