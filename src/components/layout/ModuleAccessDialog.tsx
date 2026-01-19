import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ShieldX } from "lucide-react";

interface ModuleAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleName: string;
}

export function ModuleAccessDialog({ open, onOpenChange, moduleName }: ModuleAccessDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <AlertDialogTitle className="text-xl text-center">
            ليس لديك صلاحية الدخول
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base">
            ليس لك صلاحية الدخول إلى <strong className="text-foreground">{moduleName}</strong>
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              تواصل مع المسؤول للحصول على الصلاحيات المطلوبة
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction className="min-w-[120px]">
            حسناً
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
