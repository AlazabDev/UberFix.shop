import { Property } from "@/hooks/useProperties";

interface PropertyGridProps {
  properties: Property[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onQR?: (property: Property) => void;
  onQuickRequest?: (id: string) => void;
}

export function PropertyGrid({
  properties,
}: PropertyGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => (
        <div key={property.id} className="text-center p-4 border rounded">
          <p>{property.name}</p>
        </div>
      ))}
    </div>
  );
}
