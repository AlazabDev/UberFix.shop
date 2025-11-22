import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Users, Download, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewRequestForm } from "@/components/forms/NewRequestForm";

const quickActions = [
  {
    icon: Plus,
    label: "طلب صيانة جديد",
    description: "إضافة طلب صيانة جديد",
    color: "bg-primary text-primary-foreground",
    variant: "default" as const
  },
  {
    icon: FileText,
    label: "تقرير المصروفات",
    description: "تحليل تفصيلي للميزانية",
    color: "bg-secondary text-secondary-foreground",
    variant: "secondary" as const
  },
  {
    icon: BarChart3,
    label: "تقرير الميزانية",
    description: "تحليل شامل للميزانية",
    color: "bg-success text-success-foreground",
    variant: "default" as const
  },
  {
    icon: Users,
    label: "تقرير المستخدمين",
    description: "إحصائيات المستخدمين والنشاط",
    color: "bg-warning text-warning-foreground",
    variant: "default" as const
  },
  {
    icon: BarChart3,
    label: "تقرير العقارات",
    description: "إحصائيات العقارات والوحدات",
    color: "bg-muted text-muted-foreground",
    variant: "outline" as const
  },
  {
    icon: Download,
    label: "قراءة",
    description: "",
    color: "bg-muted text-muted-foreground",
    variant: "outline" as const
  }
];

export const QuickActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

  const handleActionClick = (index: number) => {
    
    switch (index) {
      case 0: // طلب صيانة جديد
        setIsNewRequestOpen(true);
        break;
      case 1: // تقرير المصروفات
        navigate('/reports');
        break;
      case 2: // تقرير الميزانية
        navigate('/reports');
        break;
      case 3: // تقرير المستخدمين
        navigate('/reports');
        break;
      case 4: // تقرير العقارات
        navigate('/properties');
        break;
      case 5: // قراءة
        toast({
          title: "ميزة قادمة",
          description: "هذه الميزة ستكون متاحة قريباً",
        });
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">إحصائيات طلبات الصيانة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className="h-auto p-4 justify-start gap-3 text-right min-h-[80px] cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                onClick={() => handleActionClick(index)}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color} flex-shrink-0`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 text-right min-w-0 overflow-hidden">
                  <p className="font-medium text-sm leading-tight truncate">{action.label}</p>
                  {action.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{action.description}</p>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">إنشاء طلب صيانة جديد</DialogTitle>
          </DialogHeader>
          <NewRequestForm 
            onSuccess={() => setIsNewRequestOpen(false)} 
            onCancel={() => setIsNewRequestOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
