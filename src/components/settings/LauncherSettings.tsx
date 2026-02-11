import { useState } from "react";
import { icons } from "lucide-react";
import { Plus, Trash2, GripVertical, ExternalLink, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppLauncherStore, type LauncherItem } from "@/stores/useAppLauncherStore";
import { useToast } from "@/hooks/use-toast";

const colorOptions = [
  { value: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400", label: "أزرق" },
  { value: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400", label: "بنفسجي" },
  { value: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400", label: "برتقالي" },
  { value: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400", label: "أخضر" },
  { value: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400", label: "زمردي" },
  { value: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400", label: "وردي" },
  { value: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400", label: "سماوي" },
  { value: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400", label: "ذهبي" },
  { value: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400", label: "أحمر" },
  { value: "bg-slate-100 text-slate-600 dark:bg-slate-900/40 dark:text-slate-400", label: "رمادي" },
];

const popularIcons = [
  "Home", "ClipboardList", "Mail", "Calendar", "DollarSign", "Building2",
  "Users", "BarChart3", "Settings", "FileText", "MapPin", "Bell",
  "Shield", "Wrench", "Phone", "Globe", "Star", "Heart",
  "Zap", "Package", "Truck", "ShoppingCart", "CreditCard", "Key",
  "MessageSquare", "Camera", "Headphones", "Monitor", "Smartphone", "Wifi",
];

const emptyForm: Omit<LauncherItem, "id"> = {
  label: "",
  icon: "Home",
  url: "",
  color: colorOptions[0].value,
  isExternal: false,
};

export function LauncherSettings() {
  const { items, addItem, updateItem, removeItem } = useAppLauncherStore();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: LauncherItem) => {
    setEditingId(item.id);
    setForm({ label: item.label, icon: item.icon, url: item.url, color: item.color, isExternal: item.isExternal });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.label || !form.url) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    if (editingId) {
      updateItem(editingId, form);
      toast({ title: "تم التحديث", description: "تم تحديث التطبيق بنجاح" });
    } else {
      addItem(form);
      toast({ title: "تمت الإضافة", description: "تم إضافة التطبيق بنجاح" });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    removeItem(id);
    toast({ title: "تم الحذف", description: "تم حذف التطبيق من القائمة" });
  };

  const renderIcon = (iconName: string, className = "h-5 w-5") => {
    const IconComp = icons[iconName as keyof typeof icons];
    if (!IconComp) return null;
    return <IconComp className={className} />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>قائمة التطبيقات السريعة</span>
            </CardTitle>
            <CardDescription>إدارة الروابط والأيقونات التي تظهر في قائمة التطبيقات</CardDescription>
          </div>
          <Button onClick={openAdd} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            إضافة
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors group"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                {renderIcon(item.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  {item.url}
                  {item.isExternal && <ExternalLink className="h-3 w-3" />}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>لا توجد تطبيقات. اضغط "إضافة" لإنشاء رابط جديد.</p>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingId ? "تعديل التطبيق" : "إضافة تطبيق جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>الاسم *</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="مثال: البريد الإلكتروني"
              />
            </div>
            <div className="space-y-2">
              <Label>الرابط *</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="/inbox أو https://example.com"
                dir="ltr"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isExternal}
                onCheckedChange={(v) => setForm({ ...form, isExternal: v })}
              />
              <Label>رابط خارجي (يفتح في نافذة جديدة)</Label>
            </div>
            <div className="space-y-2">
              <Label>اللون</Label>
              <Select value={form.color} onValueChange={(v) => setForm({ ...form, color: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded ${c.value}`} />
                        {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الأيقونة</Label>
              <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg">
                {popularIcons.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setForm({ ...form, icon: name })}
                    className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                      form.icon === name
                        ? "bg-primary text-primary-foreground ring-2 ring-primary"
                        : "hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    {renderIcon(name, "h-5 w-5")}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="border border-border rounded-lg p-4 flex items-center justify-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${form.color}`}>
                  {renderIcon(form.icon, "h-7 w-7")}
                </div>
                <span className="text-xs font-medium">{form.label || "معاينة"}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="h-4 w-4 ml-1" />
              إلغاء
            </Button>
            <Button onClick={handleSave}>
              <Check className="h-4 w-4 ml-1" />
              {editingId ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
