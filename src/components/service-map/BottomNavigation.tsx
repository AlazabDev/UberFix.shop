import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  User,
  FileText,
  CheckCircle,
  Bell,
  Plus,
  MapPin,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  icon: React.ElementType;
  label: string;
  route: string;
  isPrimary?: boolean;
}

const navItems: NavItem[] = [
  { icon: User, label: "الملف الشخصي", route: "/profile" },
  { icon: FileText, label: "الفواتير", route: "/invoices" },
  { icon: CheckCircle, label: "الخدمات", route: "/services" },
  { icon: Bell, label: "الطلبات", route: "/requests" },
  { icon: Plus, label: "طلب سريع", route: "/quick-request", isPrimary: true },
  { icon: MapPin, label: "الخريطة", route: "/service-map" },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50">
      <div className="flex items-center justify-evenly px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.route;

          if (item.isPrimary) {
            return (
              <Button
                key={item.route}
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg -mt-6"
                onClick={() => navigate(item.route)}
              >
                <Icon className="h-6 w-6" />
              </Button>
            );
          }

          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive && "fill-current"
                )}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
