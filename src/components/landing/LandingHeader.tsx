import { Button } from "@/components/ui/button";
import { Cog, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const navItems = [
  { to: "/", label: "الرئيسية" },
  { to: "/about", label: "من نحن" },
  { to: "/services", label: "خدماتنا" },
  { to: "/projects", label: "مشاريعنا" },
  { to: "/gallery", label: "معرض الصور" },
  { to: "/blog", label: "المدونة" },
];

export const LandingHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border/50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <div className="relative">
              <span className="text-primary-foreground font-bold text-base sm:text-lg">Az</span>
              <Cog
                className="absolute -top-1 -right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground/80 animate-spin"
                style={{ animationDuration: "8s" }}
              />
            </div>
          </div>
          <div className="hidden xs:block">
            <h1 className="text-lg sm:text-xl font-bold text-primary tracking-tight">UberFix.shop</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium line-clamp-1">نظام إدارة طلبات الصيانة المتطور</p>
          </div>
        </Link>
      </div>

      {/* Desktop Navigation Menu */}
      <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Auth Buttons - visible on all screens */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link to="/role-selection" className="hidden xs:block">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9">
            تسجيل الدخول
          </Button>
        </Link>
        <Link to="/role-selection">
          <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9">إنشاء حساب</Button>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 sm:h-9 sm:w-9">
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">فتح القائمة</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <div className="relative w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-base">Az</span>
                </div>
                <span className="text-lg font-bold text-primary">UberFix.shop</span>
              </Link>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </SheetClose>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="flex flex-col gap-1 px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Mobile Auth Buttons */}
            <div className="p-4 border-t border-border space-y-3">
              <Link to="/role-selection" className="block" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link to="/role-selection" className="block" onClick={() => setIsOpen(false)}>
                <Button className="w-full">إنشاء حساب</Button>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};