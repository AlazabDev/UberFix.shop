import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  ClipboardList,
  BarChart3,
  Users,
  MapPin,
  FileText,
  Settings,
  Building2,
  Calendar,
  DollarSign,
  PlayCircle,
  Activity,
  ListChecks,
  Clock,
  Mail,
  Wallet,
  Briefcase,
  Award,
  Shield,
  UserCheck
} from "lucide-react";
import { useModulePermissions } from "@/hooks/useModulePermissions";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

// All possible menu items with their module keys
const allMenuItems = [
  // Customer & General
  { icon: Home, label: "الرئيسية", href: "/dashboard", moduleKey: "dashboard" },
  { icon: ClipboardList, label: "طلبات الصيانة", href: "/requests", moduleKey: "requests" },
  { icon: ListChecks, label: "كل الطلبات", href: "/all-requests", moduleKey: "all_requests", showBadge: true },
  { icon: Mail, label: "صندوق البريد", href: "/inbox", moduleKey: "inbox" },
  { icon: Users, label: "الموردين والفنيين", href: "/vendors", moduleKey: "vendors" },
  { icon: BarChart3, label: "التقارير والإحصائيات", href: "/reports", moduleKey: "reports" },
  { icon: Building2, label: "العقارات", href: "/properties", moduleKey: "properties" },
  { icon: Calendar, label: "المواعيد", href: "/appointments", moduleKey: "appointments" },
  { icon: DollarSign, label: "الفواتير", href: "/invoices", moduleKey: "invoices" },
  { icon: MapPin, label: "خريطة الخدمات", href: "/service-map", moduleKey: "service_map" },
  { icon: FileText, label: "التوثيق", href: "/documentation", moduleKey: "documentation" },
  { icon: Settings, label: "الإعدادات", href: "/settings", moduleKey: "settings" },
  
  // Owner/Admin only
  { icon: PlayCircle, label: "اختبار النظام", href: "/testing", moduleKey: "testing" },
  { icon: BarChart3, label: "تقرير الإنتاج", href: "/production-report", moduleKey: "production_report" },
  { icon: Clock, label: "لوحة SLA", href: "/sla-dashboard", moduleKey: "sla_dashboard" },
  { icon: Activity, label: "مراقب الإنتاج", href: "/production-monitor", moduleKey: "production_monitor" },
  { icon: UserCheck, label: "إدارة المستخدمين", href: "/admin/users", moduleKey: "admin_users" },
  { icon: UserCheck, label: "موافقات الفنيين", href: "/admin/technician-approval", moduleKey: "technician_approval" },
  { icon: Shield, label: "إعدادات المديولات", href: "/admin/module-settings", moduleKey: "module_settings" },
  
  // Technician specific
  { icon: Home, label: "لوحة الفني", href: "/technicians/dashboard", moduleKey: "technician_dashboard" },
  { icon: Briefcase, label: "المهام", href: "/technicians/tasks", moduleKey: "technician_tasks" },
  { icon: Wallet, label: "المحفظة", href: "/technicians/wallet", moduleKey: "technician_wallet" },
  { icon: Award, label: "الأرباح", href: "/technicians/earnings", moduleKey: "technician_earnings" },
];

export function RoleBasedSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { requests } = useMaintenanceRequests();
  const { isModuleEnabled, loading, userRole } = useModulePermissions();

  const isActive = (path: string) => currentPath === path;

  // Filter menu items based on permissions
  const visibleMenuItems = allMenuItems.filter(item => {
    if (loading) return false;
    return isModuleEnabled(item.moduleKey);
  });

  return (
    <Sidebar
      side="right"
      className={state === "collapsed" ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            القائمة الرئيسية
            {userRole && (
              <span className="text-xs text-muted-foreground mr-2">
                ({userRole === 'owner' ? 'المالك' : 
                  userRole === 'manager' ? 'مدير' : 
                  userRole === 'technician' ? 'فني' : 'عميل'})
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <NavLink to={item.href} end>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && (
                        <>
                          <span>{item.label}</span>
                          {item.showBadge && requests.length > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-semibold mr-auto">
                              {requests.length}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2 border-t border-border">
          {state !== "collapsed" && (
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p className="font-medium">نسخة 1.0.0</p>
              <p>© 2024 UberFix.shop</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
