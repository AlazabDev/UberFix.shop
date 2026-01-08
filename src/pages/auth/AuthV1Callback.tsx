import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthV1Callback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const tokenType = searchParams.get("token_type");
        const type = searchParams.get("type");
        const error = searchParams.get("error");
        const errorCode = searchParams.get("error_code");
        const errorDescription = searchParams.get("error_description");

        // Handle errors
        if (error || errorCode) {
          setStatus("error");
          setMessage(errorDescription || error || "Authentication failed. Please try again.");
          return;
        }

        // Handle different auth types
        if (type === "recovery") {
          setStatus("success");
          setMessage("Password recovery link verified. Redirecting...");
          setTimeout(() => {
            navigate("/auth/update-password", { replace: true });
          }, 1500);
          return;
        }

        if (type === "signup" || type === "email_confirmation") {
          setStatus("success");
          setMessage("Email verified successfully! Redirecting to login...");
          setTimeout(() => {
            navigate("/auth/login", { replace: true });
          }, 1500);
          return;
        }

        // Standard OAuth callback with tokens
        if (accessToken) {
          setStatus("success");
          setMessage("Authentication successful! Redirecting to dashboard...");
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 1500);
          return;
        }

        // Check hash fragment for implicit flow
        const hash = window.location.hash;
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const hashAccessToken = hashParams.get("access_token");
          const hashError = hashParams.get("error");
          const hashType = hashParams.get("type");

          if (hashError) {
            setStatus("error");
            setMessage(hashParams.get("error_description") || "Authentication failed.");
            return;
          }

          if (hashType === "recovery") {
            setStatus("success");
            setMessage("Password recovery verified. Redirecting...");
            setTimeout(() => {
              navigate("/auth/update-password", { replace: true });
            }, 1500);
            return;
          }

          if (hashAccessToken) {
            setStatus("success");
            setMessage("Authentication successful! Redirecting...");
            setTimeout(() => {
              navigate("/dashboard", { replace: true });
            }, 1500);
            return;
          }
        }

        // No valid auth data found
        setStatus("error");
        setMessage("Invalid authentication callback. Redirecting to login...");
        setTimeout(() => {
          navigate("/auth/login", { replace: true });
        }, 2000);

      } catch (err) {
        console.error("Auth v1 callback error:", err);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again.");
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-2xl">U</span>
          </div>
          <span className="text-2xl font-bold text-foreground">UberFix</span>
        </div>

        {/* Status Icon */}
        <div className="mb-6">
          {status === "processing" && (
            <div className="w-16 h-16 mx-auto">
              <svg className="animate-spin w-full h-full text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          {status === "success" && (
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status === "error" && (
            <div className="w-16 h-16 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Message */}
        <h1 className="text-xl font-semibold text-foreground mb-2">
          {status === "processing" && "Verifying Authentication"}
          {status === "success" && "Verification Complete"}
          {status === "error" && "Verification Failed"}
        </h1>
        <p className="text-muted-foreground">{message}</p>

        {/* Error Actions */}
        {status === "error" && (
          <div className="mt-6 flex flex-col gap-3">
            <a 
              href="https://app.uberfix.shop/auth/login"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Return to Login
            </a>
            <a 
              href="mailto:support@uberfix.shop"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact Support
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
