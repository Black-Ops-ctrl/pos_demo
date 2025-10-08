import React, { useEffect, useCallback } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

// Define the 2-minute inactivity timeout constant (120 seconds * 1000 ms/second)
const INACTIVITY_TIMEOUT_MS = 3600000; // 2 minutes

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true";
  const sessionExpirationStr = sessionStorage.getItem("sessionExpiration");
  const location = useLocation();
  const navigate = useNavigate(); // Hook for redirection

  // --- Inactivity Management Logic ---

  // Function to clear session data and redirect to login
  const logout = useCallback(() => {
    console.log("Session expired due to 2-minute inactivity. Clearing session data.");
    
    // Clear all authentication data
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("sessionExpiration");
    
    // Alert the user that they were logged out
    alert("Your session has expired due to 2-minute inactivity. Please log in again.");

    // Redirect to login
    navigate("/login", { replace: true, state: { from: location } });
  }, [navigate, location]); 


  useEffect(() => {
    let timeoutId: number | undefined;

    // Function to reset the timer and update the session expiration time
    const resetTimer = () => {
      // 1. Clear the existing timer
      clearTimeout(timeoutId);

      // 2. Set a new timer
      // If this timer expires, it means no activity was detected for 2 minutes, and logout is called.
      timeoutId = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT_MS) as unknown as number;

      // 3. Update session expiration timestamp in sessionStorage on activity
      // This is crucial for consistency if the user opens a new tab.
      const newExpirationTime = Date.now() + INACTIVITY_TIMEOUT_MS;
      sessionStorage.setItem("sessionExpiration", newExpirationTime.toString());
    };

    // Events to monitor for user activity
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart", // For touch devices
    ];

    // Only set up the timer and listeners if the user is authenticated
    if (isAuthenticated && sessionExpirationStr) {
      // 1. Set initial timer
      resetTimer(); 

      // 2. Attach listeners to the window
      activityEvents.forEach((event) => {
        window.addEventListener(event, resetTimer);
      });
    }

    // Cleanup function: runs on unmount or before re-running the effect
    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, sessionExpirationStr, logout]);


  // --- Initial Session Validity Check (For consistency, new tab, or initial load) ---

  // Function to check if the stored session time has passed
  const isSessionExpired = () => {
    if (!isAuthenticated) return false;

    // Check if the expiration time exists
    if (!sessionExpirationStr) {
      // If isAuthenticated is true but expiration is missing, force re-login
      return true; 
    }

    const expirationTime = parseInt(sessionExpirationStr, 10);
    const currentTime = Date.now();

    // Compare current time with the stored expiration time
    return currentTime > expirationTime;
  };

  const expired = isSessionExpired();

  if (!isAuthenticated || expired) {
    
    // Clear storage if the session is expired based on the timestamp check
    if (expired) {
      console.log("Session expired based on timestamp check. Clearing session data.");
      
      // Clear all authentication data from sessionStorage
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("sessionExpiration");
      
      // Note: We avoid an alert here because the timer's 'logout' function handles that when it triggers.
      // This path is usually hit when a user opens a new tab after the session has already expired.
    }
    
    // Redirect to login, preserving the path the user was trying to access
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
