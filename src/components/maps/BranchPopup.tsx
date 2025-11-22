import { MapPin, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BranchPopupProps {
  id: string;
  name: string;
  address: string;
  status?: "Active" | "Closed" | "UnderMaintenance";
}

export const BranchPopup = ({ id, name, address, status = "Active" }: BranchPopupProps) => {
  return (
    <Card className="min-w-[280px] shadow-xl border-2 border-primary/20 bg-card/98 backdrop-blur-sm">
      <CardContent className="p-4 space-y-3">
        {/* Header with Store Icon */}
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {id}
              </span>
              <Badge 
                variant={status === "Active" ? "default" : "secondary"}
                className={
                  status === "Active" 
                    ? "bg-green-100 text-green-700 hover:bg-green-100" 
                    : status === "Closed"
                    ? "bg-red-100 text-red-700 hover:bg-red-100"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                }
              >
                {status === "Active" ? "نشط" : status === "Closed" ? "مغلق" : "تحت الصيانة"}
              </Badge>
            </div>
            <h3 className="font-bold text-base text-foreground">{name}</h3>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground flex-1">{address}</p>
        </div>
      </CardContent>
    </Card>
  );
};
