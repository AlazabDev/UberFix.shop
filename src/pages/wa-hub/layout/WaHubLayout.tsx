import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard, Plus, Inbox, Phone, Webhook, Key, GitBranch,
  FileText, ChevronDown, ChevronUp, Search, MessageSquare,
  Image, Users, Megaphone, PhoneCall, BookOpen, HelpCircle,
  Mail, ChevronLeft, ChevronRight, ChevronsUpDown, MoreVertical
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  children?: { label: string; icon: React.ElementType; path: string }[];
}

const integrationItems: NavItem[] = [
  {
    label: "أرقام الهواتف",
    icon: Phone,
    path: "",
    children: [
      { label: "الأرقام المتصلة", icon: Phone, path: "/wa-hub/numbers/connected" },
      { label: "الأرقام الرقمية", icon: Phone, path: "/wa-hub/numbers/digital" },
      { label: "اختبار صندوق الرمل", icon: Phone, path: "/wa-hub/numbers/sandbox" },
    ]
  },
  { label: "ويبهوكس", icon: Webhook, path: "/wa-hub/webhooks" },
  { label: "مفاتيح واجهة برمجة التطبيقات", icon: Key, path: "/wa-hub/api-keys" },
  { label: "تدفقات واتساب", icon: GitBranch, path: "/wa-hub/flows" },
  { label: "القوالب", icon: FileText, path: "/wa-hub/templates" },
];

const dataItems: NavItem[] = [
  { label: "المحادثات", icon: MessageSquare, path: "/wa-hub/data/conversations" },
  { label: "الرسائل", icon: MessageSquare, path: "/wa-hub/data/messages" },
  { label: "الإعلام", icon: Image, path: "/wa-hub/data/media" },
  { label: "جهات الاتصال", icon: Users, path: "/wa-hub/data/contacts" },
  { label: "Ads (CTWA)", icon: Megaphone, path: "/wa-hub/data/ads" },
  { label: "Calls", icon: PhoneCall, path: "/wa-hub/data/calls" },
];

const bottomItems: NavItem[] = [
  { label: "وثائق", icon: BookOpen, path: "/wa-hub/docs" },
  { label: "المساعدة", icon: HelpCircle, path: "/wa-hub/support" },
  { label: "صندوق وارد الفريق", icon: Mail, path: "/wa-hub/team-inbox" },
];

export default function WaHubLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [phonesOpen, setPhonesOpen] = useState(true);
  const [dataOpen, setDataOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || "");
    });
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isChildActive = (children?: { path: string }[]) =>
    children?.some(c => location.pathname === c.path);

  const NavLink = ({ item }: { item: NavItem }) => {
    if (item.children) {
      const open = item.label.includes("أرقام") ? phonesOpen : dataOpen;
      const toggle = item.label.includes("أرقام") ? setPhonesOpen : setDataOpen;
      return (
        <div>
          <button
            onClick={() => toggle(!open)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors",
              isChildActive(item.children) && "text-foreground font-medium"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-right">{item.label}</span>
                {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </>
            )}
          </button>
          {open && !collapsed && (
            <div className="mr-4 mt-1 space-y-0.5">
              {item.children.map(child => (
                <button
                  key={child.path}
                  onClick={() => navigate(child.path)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm hover:bg-muted transition-colors",
                    isActive(child.path) && "bg-muted font-medium text-foreground"
                  )}
                >
                  <child.icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{child.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        onClick={() => navigate(item.path)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors",
          isActive(item.path) && "bg-muted font-medium text-foreground"
        )}
      >
        <item.icon className="h-4 w-4 flex-shrink-0" />
        {!collapsed && <span className="flex-1 text-right">{item.label}</span>}
      </button>
    );
  };

  return (
    <div className="h-screen flex w-full bg-background overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <aside className={cn(
        "h-full border-l border-border bg-card flex flex-col transition-all duration-200",
        collapsed ? "w-14" : "w-60"
      )}>
        {/* Project Switcher */}
        {!collapsed && (
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">المشروع</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCollapsed(true)}>
                <ChevronsUpDown className="h-3.5 w-3.5" />
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full mt-1 justify-between text-sm h-9">
                  <span>أوبر فيكس</span>
                  <ChevronsUpDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem>أوبر فيكس</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Search */}
        {!collapsed && (
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pr-8 h-9 text-sm"
              />
              <kbd className="absolute left-2 top-2 text-[10px] text-muted-foreground border rounded px-1">Ctrl K</kbd>
            </div>
          </div>
        )}

        {/* Collapse toggle when collapsed */}
        {collapsed && (
          <div className="p-2 border-b border-border flex justify-center">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCollapsed(false)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {/* Top nav */}
            <NavLink item={{ label: "لوحة المعلومات", icon: LayoutDashboard, path: "/wa-hub" }} />
            <NavLink item={{ label: "أضف رقماً جديداً", icon: Plus, path: "/wa-hub/numbers/add" }} />
            <NavLink item={{ label: "صندوق الوارد", icon: Inbox, path: "/wa-hub/inbox" }} />

            {/* Integration section */}
            <div className="pt-4 pb-1">
              {!collapsed && <p className="px-3 text-xs text-muted-foreground font-medium">التكامل</p>}
            </div>
            {integrationItems.map(item => (
              <NavLink key={item.label} item={item} />
            ))}

            {/* Data section */}
            <div className="pt-4 pb-1">
              {!collapsed && <p className="px-3 text-xs text-muted-foreground font-medium">البيانات</p>}
            </div>
            {dataItems.map(item => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>
        </ScrollArea>

        {/* Bottom section */}
        <div className="border-t border-border p-2 space-y-0.5">
          {bottomItems.map(item => (
            <NavLink key={item.label} item={item} />
          ))}

          {/* User badge */}
          <div className="pt-2 border-t border-border mt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {userEmail?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <>
                      <span className="text-xs flex-1 text-right truncate">{userEmail}</span>
                      <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/settings")}>الإعدادات</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>العودة للنظام الرئيسي</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => supabase.auth.signOut().then(() => navigate("/login"))}>
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
