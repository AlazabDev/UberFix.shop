import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, ArrowUpDown } from 'lucide-react';
import type { TemplateFilters, TemplateStatus, TemplateCategory } from '@/hooks/useWhatsAppTemplates';

interface TemplateFiltersBarProps {
  filters: TemplateFilters;
  onFiltersChange: (filters: Partial<TemplateFilters>) => void;
}

const STATUS_OPTIONS: { value: TemplateStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'draft', label: 'مسودة' },
  { value: 'submitted', label: 'تم الإرسال' },
  { value: 'pending', label: 'قيد المراجعة' },
  { value: 'approved', label: 'معتمد' },
  { value: 'rejected', label: 'مرفوض' },
  { value: 'paused', label: 'موقوف' },
  { value: 'disabled', label: 'معطل' },
];

const CATEGORY_OPTIONS: { value: TemplateCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'كل الفئات' },
  { value: 'utility', label: 'أداة مساعدة' },
  { value: 'marketing', label: 'تسويق' },
  { value: 'authentication', label: 'مصادقة' },
];

const LANGUAGE_OPTIONS = [
  { value: 'all', label: 'كل اللغات' },
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
  { value: 'en_US', label: 'English (US)' },
];

const SORT_OPTIONS = [
  { value: 'updated_at:desc', label: 'الأحدث تحديثاً' },
  { value: 'updated_at:asc', label: 'الأقدم تحديثاً' },
  { value: 'name:asc', label: 'الاسم (أ-ي)' },
  { value: 'name:desc', label: 'الاسم (ي-أ)' },
  { value: 'status:asc', label: 'الحالة' },
];

export function TemplateFiltersBar({ filters, onFiltersChange }: TemplateFiltersBarProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearch = () => {
    onFiltersChange({ search: searchValue || undefined, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchValue('');
    onFiltersChange({ search: undefined, page: 1 });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split(':');
    onFiltersChange({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
  };

  const hasActiveFilters = filters.status || filters.category || filters.language || filters.search;

  const clearAllFilters = () => {
    setSearchValue('');
    onFiltersChange({
      status: undefined,
      category: undefined,
      language: undefined,
      search: undefined,
      page: 1,
    });
  };

  return (
    <div className="flex flex-col gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pr-10"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={handleSearch}>بحث</Button>
      </div>

      {/* Filter Selects */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            onFiltersChange({ 
              status: value === 'all' ? undefined : value as TemplateStatus,
              page: 1 
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category || 'all'}
          onValueChange={(value) =>
            onFiltersChange({ 
              category: value === 'all' ? undefined : value as TemplateCategory,
              page: 1 
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الفئة" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.language || 'all'}
          onValueChange={(value) =>
            onFiltersChange({ 
              language: value === 'all' ? undefined : value,
              page: 1 
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="اللغة" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={`${filters.sortBy}:${filters.sortOrder}`}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-44">
            <ArrowUpDown className="h-4 w-4 ml-2" />
            <SelectValue placeholder="الترتيب" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearAllFilters} className="text-destructive">
            <X className="h-4 w-4 ml-1" />
            مسح الفلاتر
          </Button>
        )}
      </div>
    </div>
  );
}
