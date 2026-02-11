import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { icons } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppLauncherStore, type LauncherItem } from "@/stores/useAppLauncherStore";

export function AppLauncher() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { items } = useAppLauncherStore();

  const handleClick = (item: LauncherItem) => {
    setOpen(false);
    if (item.isExternal) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } else {
      navigate(item.url);
    }
  };

  const renderIcon = (iconName: string) => {
    const IconComp = icons[iconName as keyof typeof icons];
    if (!IconComp) return null;
    return <IconComp className="h-7 w-7" />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-primary/10 transition-colors touch-target tap-highlight-none"
        >
          <LayoutGrid className="h-5 w-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[320px] p-4 bg-card border-border shadow-xl rounded-xl"
      >
        <p className="text-xs font-semibold text-primary mb-3 tracking-wide">التطبيقات</p>
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-accent transition-colors group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} transition-transform group-hover:scale-110`}>
                {renderIcon(item.icon)}
              </div>
              <span className="text-xs text-foreground font-medium text-center leading-tight line-clamp-1">
                {item.label}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <button
            onClick={() => { setOpen(false); navigate("/settings?tab=launcher"); }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-accent text-sm font-medium text-muted-foreground transition-colors"
          >
            <LayoutGrid className="h-4 w-4" />
            إدارة التطبيقات
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
