import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Construction className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium">قريباً</p>
          <p className="text-sm text-muted-foreground">هذه الصفحة قيد التطوير</p>
        </CardContent>
      </Card>
    </div>
  );
}
