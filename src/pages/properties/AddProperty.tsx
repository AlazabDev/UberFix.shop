import { PropertyForm } from "@/components/forms/PropertyForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FormErrorBoundary } from "@/components/error-boundaries/FormErrorBoundary";

export default function AddProperty() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/properties")}
          className="mb-4"
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          الرجوع إلى القائمة
        </Button>
        
        <h1 className="text-3xl font-bold text-foreground">إضافة عقار جديد</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات العقار</CardTitle>
        </CardHeader>
        <CardContent>
          <FormErrorBoundary>
            <PropertyForm />
          </FormErrorBoundary>
        </CardContent>
      </Card>
    </div>
  );
}
