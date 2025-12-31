"use client";

import { useState, useEffect, useCallback } from 'react';

export interface OnlineStatusHook {
    isOnline: boolean;
    wasOffline: boolean;
    checkConnection: () => Promise<boolean>;
}

export function useOnlineStatus(): OnlineStatusHook {
    const [isOnline, setIsOnline] = useState<boolean>(true);
    const [wasOffline, setWasOffline] = useState<boolean>(false);

    // Function to check actual connectivity
    const checkConnection = useCallback(async (): Promise<boolean> => {
        try {
            // Try to fetch a small resource to verify actual connectivity
            const response = await fetch('/manifest.json', {
                method: 'HEAD',
                cache: 'no-store'
            });
            return response.ok;
        } catch {
            return false;
        }
    }, []);

    useEffect(() => {
        // Initialize with current online status
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            if (!isOnline) {
                setWasOffline(true);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        // Add event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isOnline]);

    // Reset wasOffline after a period
    useEffect(() => {
        if (wasOffline && isOnline) {
            const timer = setTimeout(() => {
                setWasOffline(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [wasOffline, isOnline]);

    return { isOnline, wasOffline, checkConnection };
}

export default useOnlineStatus;
