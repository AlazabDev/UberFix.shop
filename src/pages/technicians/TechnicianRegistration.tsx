import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Redirect page to the multi-step wizard registration
 * Based on RetailFix vendor registration system
 */
export default function TechnicianRegistration() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/technicians/registration/wizard", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">جاري التحويل إلى نظام التسجيل...</p>
      </div>
    </div>
  );
}
