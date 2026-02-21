import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, Upload, Plus, Trash2, FileText, BookOpen, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function UFBotTrainingPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch knowledge files
  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ['ufbot-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ufbot_knowledge_files')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch knowledge entries
  const { data: entries, isLoading: entriesLoading } = useQuery({
    queryKey: ['ufbot-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ufbot_knowledge_entries')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Upload file
  const [uploading, setUploading] = useState(false);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf', 'text/csv', 'application/json'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      toast({ title: "خطأ", description: "نوع الملف غير مدعوم. استخدم TXT, MD, CSV, JSON, PDF", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "خطأ", description: "حجم الملف أكبر من 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      // Read text content
      let textContent = '';
      if (file.type !== 'application/pdf') {
        textContent = await file.text();
      }

      // Upload to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('ufbot-training')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('ufbot-training').getPublicUrl(fileName);

      // Save to DB
      const { error: dbError } = await supabase
        .from('ufbot_knowledge_files')
        .insert({
          title: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type || 'text/plain',
          text_content: textContent || null,
          file_size: file.size,
        });

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['ufbot-files'] });
      toast({ title: "تم", description: `تم رفع "${file.name}" بنجاح` });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Toggle file active status
  const toggleFile = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('ufbot_knowledge_files').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ufbot-files'] }),
  });

  // Delete file
  const deleteFile = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ufbot_knowledge_files').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ufbot-files'] });
      toast({ title: "تم الحذف" });
    },
  });

  // Add entry
  const [newEntry, setNewEntry] = useState({ category: 'general', question: '', answer: '' });
  const addEntry = useMutation({
    mutationFn: async () => {
      if (!newEntry.answer.trim()) throw new Error('الإجابة مطلوبة');
      const { error } = await supabase.from('ufbot_knowledge_entries').insert(newEntry);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ufbot-entries'] });
      setNewEntry({ category: 'general', question: '', answer: '' });
      toast({ title: "تمت الإضافة" });
    },
    onError: (err: any) => toast({ title: "خطأ", description: err.message, variant: "destructive" }),
  });

  // Delete entry
  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ufbot_knowledge_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ufbot-entries'] });
      toast({ title: "تم الحذف" });
    },
  });

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          تدريب UFBot
        </CardTitle>
        <CardDescription>إدارة قاعدة المعرفة وملفات التدريب للمساعد الذكي</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="files" dir="rtl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="files" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              ملفات التدريب
            </TabsTrigger>
            <TabsTrigger value="entries" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              أسئلة وأجوبة
            </TabsTrigger>
          </TabsList>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  رفع ملف تدريب
                </div>
              </Label>
              <Input id="file-upload" type="file" className="hidden" accept=".txt,.md,.csv,.json,.pdf" onChange={handleFileUpload} disabled={uploading} />
              <p className="text-xs text-muted-foreground">TXT, MD, CSV, JSON, PDF (حد أقصى 5MB)</p>
            </div>

            {filesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-2">
                {files?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">لا توجد ملفات تدريب بعد</p>
                )}
                {files?.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{file.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : 'N/A'}
                          {' • '}
                          {file.text_content ? `${file.text_content.length} حرف` : 'بدون محتوى نصي'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={file.is_active ? "default" : "secondary"}>
                        {file.is_active ? 'مفعّل' : 'معطّل'}
                      </Badge>
                      <Switch
                        checked={file.is_active}
                        onCheckedChange={(checked) => toggleFile.mutate({ id: file.id, is_active: checked })}
                      />
                      <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => deleteFile.mutate(file.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Entries Tab */}
          <TabsContent value="entries" className="space-y-4 mt-4">
            {/* Add new entry */}
            <Card className="p-4 bg-muted/30 border-dashed">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label>التصنيف</Label>
                    <Select value={newEntry.category} onValueChange={(v) => setNewEntry(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">عام</SelectItem>
                        <SelectItem value="services">خدمات</SelectItem>
                        <SelectItem value="pricing">أسعار</SelectItem>
                        <SelectItem value="support">دعم فني</SelectItem>
                        <SelectItem value="policies">سياسات</SelectItem>
                        <SelectItem value="about">عن الشركة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>السؤال (اختياري)</Label>
                  <Input
                    value={newEntry.question}
                    onChange={(e) => setNewEntry(p => ({ ...p, question: e.target.value }))}
                    placeholder="مثال: ما هي أوقات العمل؟"
                  />
                </div>
                <div>
                  <Label>الإجابة / المعلومة *</Label>
                  <Textarea
                    value={newEntry.answer}
                    onChange={(e) => setNewEntry(p => ({ ...p, answer: e.target.value }))}
                    placeholder="اكتب المعلومة أو الإجابة هنا..."
                    rows={3}
                  />
                </div>
                <Button onClick={() => addEntry.mutate()} disabled={!newEntry.answer.trim() || addEntry.isPending}>
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة
                </Button>
              </div>
            </Card>

            {entriesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-2">
                {entries?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">لا توجد إدخالات بعد</p>
                )}
                {entries?.map(entry => (
                  <div key={entry.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                        </div>
                        {entry.question && <p className="text-sm font-medium mb-1">س: {entry.question}</p>}
                        <p className="text-sm text-muted-foreground">{entry.answer.slice(0, 150)}{entry.answer.length > 150 ? '...' : ''}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 shrink-0" onClick={() => deleteEntry.mutate(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
