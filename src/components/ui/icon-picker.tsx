import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface IconPickerProps {
  value?: string;
  onValueChange: (value: string) => void;
  trigger?: React.ReactNode;
}

// قائمة الأيقونات من مجلد pin-pro
const PIN_ICONS = Array.from({ length: 140 }, (_, i) => ({
  id: `pin-pro-${i + 1}`,
  path: `/icons/pin-pro/pin-pro-${i + 1}.svg`,
  name: `أيقونة ${i + 1}`
}));

export function IconPicker({ value, onValueChange, trigger }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(value || "");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSelectedIcon(value || "");
    });

    return () => cancelAnimationFrame(frame);
  }, [value]);

  const filteredIcons = PIN_ICONS.filter(icon =>
    icon.name.includes(searchTerm) || icon.id.includes(searchTerm)
  );

  const handleSelect = (iconPath: string) => {
    setSelectedIcon(iconPath);
    onValueChange(iconPath);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" className="w-full justify-start">
            {selectedIcon ? (
              <div className="flex items-center gap-2">
                <img src={selectedIcon} alt="Icon" className="h-6 w-6" />
                <span>تم اختيار الأيقونة</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>اختر أيقونة العقار</span>
              </div>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            اختر أيقونة للعقار
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن أيقونة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Selected Icon Preview */}
          {selectedIcon && (
            <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
              <img src={selectedIcon} alt="Selected" className="h-12 w-12" />
              <div>
                <p className="text-sm font-medium">الأيقونة المختارة</p>
                <p className="text-xs text-muted-foreground">{selectedIcon}</p>
              </div>
              <Badge variant="secondary" className="mr-auto">محدد</Badge>
            </div>
          )}

          {/* Icons Grid */}
          <ScrollArea className="h-[500px] rounded-md border p-4">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {filteredIcons.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => handleSelect(icon.path)}
                  className={`p-3 rounded-lg border-2 hover:border-primary hover:bg-primary/5 transition-all ${
                    selectedIcon === icon.path
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border"
                  }`}
                  title={icon.name}
                >
                  <img
                    src={icon.path}
                    alt={icon.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>

            {filteredIcons.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                لا توجد أيقونات تطابق البحث
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
