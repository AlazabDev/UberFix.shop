import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ArchivedProperties() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["archived-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "archived")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("properties")
        .update({ status: "active" })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archived-properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("تم استرجاع العقار بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء استرجاع العقار");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archived-properties"] });
      toast.success("تم حذف العقار نهائياً");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف العقار");
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button
            variant="default"
            onClick={() => navigate("/properties")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            الرجوع إلى العقارات
          </Button>
          <h1 className="text-2xl font-bold">العقارات المؤرشفة</h1>
          <p className="text-muted-foreground">
            عدد العقارات المؤرشفة: {properties.length}
          </p>
        </div>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            لا توجد عقارات مؤرشفة
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <CardContent className="p-4">
                {property.images && property.images[0] && (
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}

                <h3 className="font-bold text-lg mb-1">{property.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {property.type}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {property.address}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => restoreMutation.mutate(property.id)}
                    disabled={restoreMutation.isPending}
                  >
                    <RotateCcw className="h-4 w-4 ml-1" />
                    استرجاع
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 ml-1" />
                        حذف نهائي
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف النهائي</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف العقار "{property.name}" نهائياً؟ لا
                          يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(property.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          حذف نهائي
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
