import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PropertyFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
}

export function PropertyFilters({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType
}: PropertyFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger>
          <SelectValue placeholder="كل الحالات" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل الحالات</SelectItem>
          <SelectItem value="active">نشطة</SelectItem>
          <SelectItem value="inactive">متوقفة</SelectItem>
          <SelectItem value="maintenance">تحت الصيانة</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger>
          <SelectValue placeholder="كل الأنواع" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل الأنواع</SelectItem>
          <SelectItem value="residential">مشروع</SelectItem>
          <SelectItem value="commercial">فرع</SelectItem>
          <SelectItem value="industrial">مستودع</SelectItem>
          <SelectItem value="office">وحدة</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="ابحث عن عقار بالاسم أو العنوان..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>
    </div>
  );
}
