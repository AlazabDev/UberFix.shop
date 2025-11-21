import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";

interface IconSelectorProps {
  value: string | null;
  onChange: (iconPath: string) => void;
  specialization?: string;
}

interface SpecializationIcon {
  id: string;
  name: string;
  name_ar: string;
  icon_path: string;
  color: string;
  sort_order: number;
}

export const IconSelector = ({ value, onChange, specialization: _specialization }: IconSelectorProps) => {
  const [icons, setIcons] = useState<SpecializationIcon[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIcons();
  }, []);

  const fetchIcons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('specialization_icons')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setIcons(data || []);
    } catch (error) {
      console.error('Error fetching icons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIconSelect = (iconPath: string) => {
    onChange(iconPath);
    setOpen(false);
  };

  const selectedIcon = icons.find(icon => icon.icon_path === value);

  return (
    <div className="space-y-2">
      <Label>أيقونة الفني على الخريطة</Label>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-20 flex items-center justify-center gap-3"
          >
            {value ? (
              <>
                <img 
                  src={value} 
                  alt="Selected icon" 
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedIcon?.name_ar || 'أيقونة محددة'}
                </span>
              </>
            ) : (
              <>
                <MapPin className="w-8 h-8 text-muted-foreground" />
                <span className="text-muted-foreground">اختر أيقونة</span>
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>اختر أيقونة الفني</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px] w-full p-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                جاري التحميل...
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {icons.map((icon) => (
                  <button
                    key={icon.id}
                    type="button"
                    onClick={() => handleIconSelect(icon.icon_path)}
                    className={`
                      p-4 rounded-lg border-2 transition-all hover:shadow-lg
                      flex flex-col items-center justify-center gap-2
                      ${value === icon.icon_path 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: icon.color + '20' }}
                    >
                      <img 
                        src={icon.icon_path} 
                        alt={icon.name_ar}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <span className="text-xs text-center font-medium">
                      {icon.name_ar}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
