import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, RefreshCw, HelpCircle, ExternalLink } from "lucide-react";

export default function WaFlows() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">تدفقات واتساب</h1>
          <Badge variant="secondary">الإصدار بيتا</Badge>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <HelpCircle className="h-4 w-4 ml-1" />ما هذا؟
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><RefreshCw className="h-4 w-4 ml-2" />مزامنة من ميتا</Button>
          <Button className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 ml-2" />إنشاء تدفق</Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        يتيح لك تدفقات واتساب إنشاء نماذج تفاعلية وجمع بيانات منظمة من المستخدمين.{" "}
        <a href="#" className="text-green-600 inline-flex items-center gap-1">
          تعرف على المزيد <ExternalLink className="h-3 w-3" />
        </a>
      </p>

      <Tabs defaultValue="flows">
        <TabsList>
          <TabsTrigger value="flows">التدفقات</TabsTrigger>
          <TabsTrigger value="responses">الردود</TabsTrigger>
        </TabsList>
        <TabsContent value="flows">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="responses">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">لا توجد ردود متاحة</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
