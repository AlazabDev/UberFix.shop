// facebook-login-debug.ts

/**
 * Debugging utilities for Facebook login issues.
 * This module provides functions to help developers diagnose and fix
 * common problems encountered during the Facebook login process.
 */

/**
 * Log any errors occurred during the Facebook login process.
 * @param error - The error object returned by Facebook SDK.
 */
function logFacebookLoginError(error: any): void {
    console.error("Facebook Login Error:", error);
}

/**
 * Function to simulate a Facebook login issue for testing.
 * @returns {boolean} - Returns false to simulate a failure.
 */
function simulateFacebookLoginIssue(): boolean {
    logFacebookLoginError({ message: "Simulated error for testing." });
    return false;
}

// Exporting functions for external use
export { logFacebookLoginError, simulateFacebookLoginIssue };