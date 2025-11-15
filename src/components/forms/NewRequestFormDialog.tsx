import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NewRequestForm } from "./NewRequestForm";
import { Plus } from "lucide-react";
import { FormErrorBoundary } from "@/components/error-boundaries/FormErrorBoundary";

interface NewRequestFormDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function NewRequestFormDialog({ trigger, onSuccess }: NewRequestFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-gradient-primary">
            <Plus className="h-4 w-4" />
            طلب صيانة جديد
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">إنشاء طلب صيانة جديد</DialogTitle>
        </DialogHeader>
        <FormErrorBoundary>
          <NewRequestForm 
            onSuccess={handleSuccess} 
            onCancel={() => setIsOpen(false)} 
          />
        </FormErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}