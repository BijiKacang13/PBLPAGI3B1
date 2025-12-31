"use client";

import React, { useEffect, useRef, createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import useOnlineStatus from '@/hooks/useOnlineStatus';
import OfflineAlert from './OfflineAlert';

interface OfflineContextType {
    isOnline: boolean;
    wasOffline: boolean;
}

const OfflineContext = createContext<OfflineContextType>({
    isOnline: true,
    wasOffline: false
});

export const useOfflineContext = () => useContext(OfflineContext);

interface OfflineProviderProps {
    children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
    const pathname = usePathname();
    const { isOnline, wasOffline } = useOnlineStatus();
    const previousPathRef = useRef<string>('/login');
    const [hasTriggeredRedirect, setHasTriggeredRedirect] = useState(false);

    // Check if we're on offline page
    const isOnOfflinePage = pathname === '/offline' ||
        (typeof window !== 'undefined' && window.location.pathname === '/offline.html');

    // Store the current path when online and not on offline page
    useEffect(() => {
        if (isOnline && !isOnOfflinePage) {
            previousPathRef.current = pathname;
            setHasTriggeredRedirect(false);

            // Also store in sessionStorage for the static offline page to use
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('previousPath', pathname);

                // Save last sync time for offline page to display
                localStorage.setItem('sia-last-sync', new Date().toISOString());
            }
        }
    }, [pathname, isOnline, isOnOfflinePage]);

    // Handle navigation when going offline - called by alert button
    const handleNavigateOffline = useCallback(() => {
        if (!isOnOfflinePage) {
            setHasTriggeredRedirect(true);
            // Navigate to static HTML page
            window.location.href = '/offline.html';
        }
    }, [isOnOfflinePage]);

    // Handle navigation when coming back online
    const handleNavigateBack = useCallback(() => {
        if (isOnOfflinePage && previousPathRef.current) {
            window.location.href = previousPathRef.current;
        }
    }, [isOnOfflinePage]);

    // Check if we're on a page that handles offline state itself (no redirect needed)
    // Use both pathname from hook AND window.location.pathname for reliability
    const isLoginPage = pathname === '/login' ||
        (typeof window !== 'undefined' && window.location.pathname === '/login');

    // Auto-redirect to offline page when connection is lost
    // BUT NOT for login page - it handles offline state on its own
    useEffect(() => {
        // Re-check isLoginPage inside effect to capture current state
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
        const currentPathIsLogin = currentPath === '/login';

        console.log('[OfflineProvider] State check:', {
            isOnline,
            pathname,
            currentPath,
            currentPathIsLogin,
            isOnOfflinePage,
            hasTriggeredRedirect
        });

        if (!isOnline && !isOnOfflinePage && !hasTriggeredRedirect && !currentPathIsLogin) {
            console.log('[OfflineProvider] Detected offline, will redirect in 2.5s');
            const timer = setTimeout(() => {
                // Double-check we're still not on login before redirecting
                const stillNotLogin = window.location.pathname !== '/login';
                console.log('[OfflineProvider] Timeout fired, stillNotLogin:', stillNotLogin);
                if (stillNotLogin) {
                    console.log('[OfflineProvider] Redirecting to /offline.html');
                    setHasTriggeredRedirect(true);
                    window.location.href = '/offline.html';
                } else {
                    console.log('[OfflineProvider] Redirect cancelled - on login page');
                }
            }, 2500);
            return () => clearTimeout(timer);
        } else if (!isOnline && currentPathIsLogin) {
            console.log('[OfflineProvider] On login page, NOT redirecting');
        }
    }, [isOnline, isOnOfflinePage, hasTriggeredRedirect, isLoginPage, pathname]);

    // Auto-redirect back when coming online from offline page
    useEffect(() => {
        if (isOnline && wasOffline && isOnOfflinePage) {
            console.log('[OfflineProvider] Back online, will redirect to previous page in 3s');
            const timer = setTimeout(() => {
                const targetPath = previousPathRef.current || sessionStorage.getItem('previousPath') || '/login';
                console.log('[OfflineProvider] Redirecting to', targetPath);
                window.location.href = targetPath;
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOffline, isOnOfflinePage]);

    return (
        <OfflineContext.Provider value={{ isOnline, wasOffline }}>
            {/* Don't show OfflineAlert on login page - it has its own */}
            {!isLoginPage && (
                <OfflineAlert
                    isOnline={isOnline}
                    wasOffline={wasOffline}
                    onNavigateOffline={handleNavigateOffline}
                    onNavigateBack={handleNavigateBack}
                />
            )}
            {children}
        </OfflineContext.Provider>
    );
}

export default OfflineProvider;
