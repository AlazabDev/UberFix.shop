import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, UserCheck, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceRequestActionsProps {
  request: any;
}

export function MaintenanceRequestActions({ request }: MaintenanceRequestActionsProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  
  const [newStatus, setNewStatus] = useState(request.status);
  const [notes, setNotes] = useState('');

  const updateRequestStatus = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          status: newStatus
        })
        .eq('id', request.id);

      if (error) throw error;

      // إنشاء إشعار للمستخدم
      if (request.created_by) {
        const statusMessages: Record<string, string> = {
          'Open': 'طلبك مفتوح',
          'InProgress': 'جاري العمل على طلبك',
          'Completed': 'تم إكمال طلبك',
          'Cancelled': 'تم إلغاء طلبك'
        };

        await supabase.from('notifications').insert({
          recipient_id: request.created_by,
          title: 'تحديث حالة الطلب',
          message: statusMessages[newStatus] || 'تم تحديث حالة طلبك',
          type: newStatus === 'Completed' ? 'success' : 'info',
          entity_type: 'maintenance_request',
          entity_id: request.id
        });
      }

      toast({
        title: "تم تحديث الحالة",
        description: "تم تحديث حالة الطلب بنجاح وإرسال إشعار للعميل",
      });

      setShowStatusDialog(false);
      window.location.reload();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الطلب",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const addComment = async () => {
    setIsUpdating(true);
    try {
      // حفظ الملاحظات في vendor_notes مباشرة
      await supabase
        .from('maintenance_requests')
        .update({ vendor_notes: notes })
        .eq('id', request.id);

      toast({
        title: "تم إضافة الملاحظة",
        description: "تم إضافة ملاحظتك بنجاح",
      });

      setShowVendorDialog(false);
      setNotes('');
      window.location.reload();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الملاحظة",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteRequest = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .delete()
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: "تم حذف الطلب",
        description: "تم حذف الطلب بنجاح",
      });

      window.location.reload();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الطلب",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isUpdating}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowStatusDialog(true)}>
            <Edit className="h-4 w-4 ml-2" />
            تحديث الحالة
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowVendorDialog(true)}>
            <UserCheck className="h-4 w-4 ml-2" />
            إضافة ملاحظة
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={deleteRequest}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 ml-2" />
            حذف الطلب
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تحديث حالة الطلب</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>الحالة الحالية</Label>
              <Badge variant="outline" className="mt-1">
                {request.status}
              </Badge>
            </div>
            
            <div>
              <Label htmlFor="status">الحالة الجديدة</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">مفتوح</SelectItem>
                  <SelectItem value="Assigned">معين</SelectItem>
                  <SelectItem value="InProgress">قيد التنفيذ</SelectItem>
                  <SelectItem value="Waiting">في الانتظار</SelectItem>
                  <SelectItem value="Completed">مكتمل</SelectItem>
                  <SelectItem value="Rejected">مرفوض</SelectItem>
                  <SelectItem value="Cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowStatusDialog(false)}
                disabled={isUpdating}
              >
                إلغاء
              </Button>
              <Button 
                onClick={updateRequestStatus}
                disabled={isUpdating || newStatus === request.status}
              >
                {isUpdating ? "جاري التحديث..." : "تحديث"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Comment Dialog */}
      <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة ملاحظة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">الملاحظة</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف ملاحظات حول الطلب..."
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowVendorDialog(false)}
                disabled={isUpdating}
              >
                إلغاء
              </Button>
              <Button 
                onClick={addComment}
                disabled={isUpdating || !notes.trim()}
              >
                {isUpdating ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}