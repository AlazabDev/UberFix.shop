import { Button } from "@/components/ui/button";
import { Cog } from "lucide-react";
import { Link } from "react-router-dom";

export const LandingHeader = () => {
  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border/50 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
            <div className="relative">
              <span className="text-primary-foreground font-bold text-lg">Az</span>
              <Cog
                className="absolute -top-1 -right-1 h-3 w-3 text-primary-foreground/80 animate-spin"
                style={{ animationDuration: "8s" }}
              />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary tracking-tight">UberFix.shop</h1>
            <p className="text-xs text-muted-foreground font-medium">نظام إدارة طلبات الصيانة المتطور</p>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="hidden md:flex items-center gap-6">
        <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
          الرئيسية
        </Link>
        <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
          من نحن
        </Link>
        <Link to="/services" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
          خدماتنا
        </Link>
        <Link to="/projects" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
          مشاريعنا
        </Link>
        <Link to="/gallery" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
          معرض الصور
        </Link>
        <Link to="/blog" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
          المدونة
        </Link>
      </nav>

      {/* Auth Buttons */}
      <div className="flex items-center gap-4">
        <Link to="/role-selection">
          <Button variant="outline" size="sm">
            تسجيل الدخول
          </Button>
        </Link>
        <Link to="/role-selection">
          <Button size="sm">إنشاء حساب</Button>
        </Link>
      </div>
    </header>
  );
};
