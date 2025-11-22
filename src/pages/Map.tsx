import { InteractiveMap } from '@/modules/map/InteractiveMap';
import { BottomNavigation } from '@/components/service-map/BottomNavigation';
import { Cog } from 'lucide-react';

export default function Map() {
  return (
    <div className="relative h-screen w-full flex flex-col">
      {/* Header */}
      <header className="h-14 flex items-center border-b border-border px-4 bg-card/95 backdrop-blur-sm z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
            <div className="relative">
              <span className="text-primary-foreground font-bold text-base">A</span>
              <Cog className="absolute -top-1 -right-1 h-2.5 w-2.5 text-primary-foreground/80 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary">UberFix.shop</h1>
            <p className="text-xs text-muted-foreground">خريطة الفنيين</p>
          </div>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <InteractiveMap />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
