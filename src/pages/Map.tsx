import { InteractiveMap } from '@/modules/map/InteractiveMap';
import { BottomNavigation } from '@/components/service-map/BottomNavigation';

export default function Map() {
  return (
    <div className="relative h-screen w-full">
      <InteractiveMap />
      <BottomNavigation />
    </div>
  );
}
