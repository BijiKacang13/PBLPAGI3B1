/**
 * Session Handler Utility
 * Centralized handling for session expiration
 */

/**
 * Handle session expiration - clears all localStorage and dispatches event
 */
export const handleSessionExpired = () => {
    if (typeof window !== "undefined") {
        if (!window.location.pathname.includes("/login")) {
            // Clear all auth data
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            localStorage.removeItem("user_role");
            localStorage.removeItem("user_unit_id");
            localStorage.removeItem("user_unit_name");
            localStorage.removeItem("session_expires_in");
            localStorage.removeItem("remember_me");

            // Dispatch custom event that SessionProvider will catch
            window.dispatchEvent(new CustomEvent("session-expired"));
        }
    }
};

/**
 * Check response status and handle 401 errors
 * @param response - Fetch Response object
 * @returns true if session is valid, false if expired
 */
export const checkSessionValid = (response: Response): boolean => {
    if (response.status === 401) {
        handleSessionExpired();
        return false;
    }
    return true;
};

/**
 * Get auth headers for fetch requests
 */
export const getAuthHeaders = (includeContentType: boolean = true): HeadersInit => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const headers: Record<string, string> = {
        Accept: "application/json",
    };

    if (includeContentType) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
};

/**
 * Wrapper for fetch that automatically handles 401 errors
 */
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    checkSessionValid(response);

    return response;
};
