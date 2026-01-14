import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
      <div className="text-center space-y-6 p-8">
        <div className="text-8xl font-bold text-primary">404</div>
        <h1 className="text-2xl font-semibold text-foreground">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/" className="gap-2">
              <Home className="h-4 w-4" />
              العودة للرئيسية
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard" className="gap-2">
              لوحة التحكم
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
