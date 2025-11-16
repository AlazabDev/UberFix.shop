import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LayoutGrid, Upload, QrCode, FileDown } from "lucide-react";

export function PropertySettingsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          إعدادات العقارات
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem>
          <LayoutGrid className="h-4 w-4 ml-2" />
          إدارة المخططات
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Upload className="h-4 w-4 ml-2" />
          استيراد عقارات
        </DropdownMenuItem>
        <DropdownMenuItem>
          <QrCode className="h-4 w-4 ml-2" />
          تحميل رموز QR للعقارات
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileDown className="h-4 w-4 ml-2" />
          تحميل رمز QR لطلبات الصيانة للعملاء
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
