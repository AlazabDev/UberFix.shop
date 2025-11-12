import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, ClipboardList, FileText, CheckCircle, User } from 'lucide-react';

export default function Navigation() {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: '/', label: 'الخريطة', icon: MapPin },
    { path: '/quick-request', label: 'طلب سريع', icon: Plus },
    { path: '/track-orders', label: 'تتبع الطلبات', icon: ClipboardList },
    { path: '/completed-services', label: 'الخدمات المكتملة', icon: CheckCircle },
    { path: '/invoices', label: 'الفواتير', icon: FileText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center overflow-x-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant={isActive(item.path) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 whitespace-nowrap ${
                isActive(item.path) ? 'bg-blue-600 text-white' : 'text-gray-600'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-gray-600"
        >
          <User size={20} />
          <span className="text-xs">الملف الشخصي</span>
        </Button>
      </div>
    </nav>
  );
}
