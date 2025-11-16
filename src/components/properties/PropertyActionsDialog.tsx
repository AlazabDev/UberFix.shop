import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Wrench, Archive } from "lucide-react";
import { PropertyQRCode } from "./PropertyQRCode";

interface PropertyActionsDialogProps {
  propertyId: string;
  propertyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyActionsDialog({
  propertyId,
  propertyName,
  open,
  onOpenChange,
}: PropertyActionsDialogProps) {
  const navigate = useNavigate();

  const handleEditProperty = () => {
    navigate(`/properties/edit/${propertyId}`);
    onOpenChange(false);
  };

  const handleNewMaintenanceRequest = () => {
    navigate(`/requests/new?propertyId=${propertyId}`);
    onOpenChange(false);
  };

  const handleAddSubProperty = () => {
    navigate(`/properties/add?parentId=${propertyId}`);
    onOpenChange(false);
  };

  const handleArchiveProperty = () => {
    // TODO: Implement archive functionality
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{propertyName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Button
            onClick={handleEditProperty}
            variant="outline"
            className="w-full justify-start gap-3 h-12"
          >
            <Edit className="h-4 w-4" />
            تعديل بيانات العقار
          </Button>

          <Button
            onClick={handleNewMaintenanceRequest}
            variant="outline"
            className="w-full justify-start gap-3 h-12"
          >
            <Wrench className="h-4 w-4" />
            طلب صيانة جديد
          </Button>

          <Button
            onClick={handleAddSubProperty}
            variant="outline"
            className="w-full justify-start gap-3 h-12"
          >
            <Plus className="h-4 w-4" />
            إضافة عقار فرعي
          </Button>

          <PropertyQRCode propertyId={propertyId} propertyName={propertyName} />

          <Button
            onClick={handleArchiveProperty}
            variant="outline"
            className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive"
          >
            <Archive className="h-4 w-4" />
            أرشفة العقار
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
