import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Key, Trash2, Copy } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function WaApiKeys() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const { toast } = useToast();

  const { data: keys, isLoading, refetch } = useQuery({
    queryKey: ["wa-api-keys"],
    queryFn: async () => {
      const { data } = await supabase.from("wa_api_keys").select("*").is("revoked_at", null).order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleCreate = async () => {
    if (!name) return;
    const { data: project } = await supabase.from("wa_projects").select("id").limit(1).single();
    if (!project) return;
    const key = `wk_${crypto.randomUUID().replace(/-/g, "")}`;
    await supabase.from("wa_api_keys").insert({
      project_id: project.id,
      name,
      key_prefix: key.slice(0, 8),
      key_hash: key,
    });
    toast({ title: "تم إنشاء المفتاح", description: key });
    setName("");
    setShowCreate(false);
    refetch();
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مفاتيح واجهة برمجة التطبيقات</h1>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 ml-2" />إنشاء مفتاح API</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>إنشاء مفتاح API جديد</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="اسم المفتاح" value={name} onChange={e => setName(e.target.value)} />
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
                <TableHead>الاسم</TableHead>
                <TableHead>المفتاح</TableHead>
                <TableHead>آخر استخدام</TableHead>
                <TableHead>تأسيس</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12">جاري التحميل...</TableCell></TableRow>
              ) : !keys?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <Key className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-lg font-medium">لا توجد مفاتيح API</p>
                    <p className="text-sm text-muted-foreground">أنشئ مفتاح API للتكامل</p>
                  </TableCell>
                </TableRow>
              ) : (
                keys.map(k => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm">{k.key_prefix}...****</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Copy className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {k.last_used_at ? formatDistanceToNow(new Date(k.last_used_at), { locale: ar, addSuffix: true }) : "لم يستخدم"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(k.created_at), { locale: ar, addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
