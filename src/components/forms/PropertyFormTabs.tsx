import { Button } from "@/components/ui/button";

interface PropertyFormTabsProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export function PropertyFormTabs({ selectedType, onTypeChange }: PropertyFormTabsProps) {
  const types = [
    { value: "residential", label: "المشروع" },
    { value: "commercial", label: "الفرع" },
    { value: "office", label: "الوحدة" },
    { value: "industrial", label: "المستودع" },
    { value: "mixed_use", label: "أخرى" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {types.map((type) => (
        <Button
          key={type.value}
          type="button"
          variant={selectedType === type.value ? "default" : "outline"}
          onClick={() => onTypeChange(type.value)}
          className="min-w-[100px]"
        >
          {type.label}
        </Button>
      ))}
    </div>
  );
}
