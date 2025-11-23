import { MapPin, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BranchInfoCardProps {
  id: string;
  name: string;
  location: string;
  status: "Active" | "Closed" | "UnderMaintenance";
}

export const BranchInfoCard = ({ id, name, location, status }: BranchInfoCardProps) => {
  return (
    <Card className="shadow-lg border-2 border-primary/20 bg-card/98 backdrop-blur-sm">
      <CardContent className="p-4 space-y-3">
        {/* Branch ID Badge */}
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>ID</span>
          </div>
          <span className="font-mono font-bold text-foreground">{id}</span>
        </div>

        {/* Branch Name */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-lg text-foreground">{name}</h3>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{location}</p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 pt-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <Badge 
            variant="default"
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
      </CardContent>
    </Card>
  );
};
