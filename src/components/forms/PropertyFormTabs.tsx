import { Button } from "@/components/ui/button";
import { PROPERTY_TYPES_LIST } from "@/constants/propertyConstants";

interface PropertyFormTabsProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export function PropertyFormTabs({ selectedType, onTypeChange }: PropertyFormTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {PROPERTY_TYPES_LIST.map((type) => (
        <Button
          key={type.value}
          type="button"
          variant={selectedType === type.value ? "default" : "outline"}
          onClick={() => onTypeChange(type.value)}
          className="min-w-[100px]"
        >
          {type.icon} {type.label}
        </Button>
      ))}
    </div>
  );
}
