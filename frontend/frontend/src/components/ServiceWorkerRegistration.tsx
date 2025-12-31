"use client";

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Register service worker on page load
            window.addEventListener('load', () => {
                registerServiceWorker();
            });

            // Also try to register immediately if window is already loaded
            if (document.readyState === 'complete') {
                registerServiceWorker();
            }
        }
    }, []);

    const registerServiceWorker = async () => {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });

            console.log('[SW] Service Worker registered successfully:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('[SW] New content available, refresh to update.');
                            // Optionally show update notification to user
                        }
                    });
                }
            });

            // Handle controller change (new service worker activated)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[SW] Controller changed, reloading page...');
                // Optionally reload the page when new SW takes over
                // window.location.reload();
            });

        } catch (error) {
            console.error('[SW] Service Worker registration failed:', error);
        }
    };

    return null; // This component doesn't render anything
}

export default ServiceWorkerRegistration;
