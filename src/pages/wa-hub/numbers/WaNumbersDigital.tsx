import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WaNumbersDigital() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">أرقام الهواتف الرقمية</h1>
          <p className="text-sm text-muted-foreground mt-1">الأرقام التي نوفرها كابسو مشمولة في خطتك.</p>
        </div>
        <Button onClick={() => navigate("/wa-hub/numbers/add")} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 ml-2" />
          أضف رقم الهاتف
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Phone className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">لا أرقام هواتف</h2>
          <p className="text-muted-foreground mb-6">توفير أرقام هواتف لإعداد واتساب</p>
          <Button onClick={() => navigate("/wa-hub/numbers/add")} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 ml-2" />
            أضف رقمك الأول
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
