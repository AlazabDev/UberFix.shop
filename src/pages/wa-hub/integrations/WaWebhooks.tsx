import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Webhook, Trash2, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export default function WaWebhooks() {
  const [showCreate, setShowCreate] = useState(false);
  const [url, setUrl] = useState("");

  const { data: webhooks, isLoading, refetch } = useQuery({
    queryKey: ["wa-webhooks"],
    queryFn: async () => {
      const { data } = await supabase.from("wa_webhooks").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleCreate = async () => {
    if (!url) return;
    const { data: project } = await supabase.from("wa_projects").select("id").limit(1).single();
    if (!project) return;
    await supabase.from("wa_webhooks").insert({ project_id: project.id, url, secret: crypto.randomUUID() });
    setUrl("");
    setShowCreate(false);
    refetch();
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ويبهوكس</h1>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 ml-2" />إنشاء Webhook</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>إنشاء Webhook جديد</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="https://example.com/webhook" value={url} onChange={e => setUrl(e.target.value)} dir="ltr" />
              <Button onClick={handleCreate} className="w-full bg-green-600 hover:bg-green-700">إنشاء</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تأسيس</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12">جاري التحميل...</TableCell></TableRow>
              ) : !webhooks?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-16">
                    <Webhook className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-lg font-medium">لا يوجد Webhooks</p>
                    <p className="text-sm text-muted-foreground">أنشئ webhook لتلقي الإشعارات</p>
                  </TableCell>
                </TableRow>
              ) : (
                webhooks.map(wh => (
                  <TableRow key={wh.id}>
                    <TableCell className="font-mono text-sm" dir="ltr">{wh.url}</TableCell>
                    <TableCell>
                      <Badge variant={wh.enabled ? "default" : "secondary"}>
                        {wh.enabled ? "مفعل" : "معطل"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(wh.created_at), { locale: ar, addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
