import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from "date-fns";
import { ar } from "date-fns/locale";

interface MaintenanceRequest {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  service_type?: string;
  created_at: string;
  sla_due_date?: string;
  client_name?: string;
  workflow_stage?: string;
}

interface Category {
  id: string;
  name: string;
}

interface WorkOrdersCalendarProps {
  requests: MaintenanceRequest[];
  onRequestClick?: (requestId: string) => void;
  categories?: Category[];
}

// Filter dropdown component
const FilterDropdown = ({
  label,
  options,
  selectedValues,
  onToggle,
  onClear,
  searchable = false,
  badge = 0,
}: {
  label: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  searchable?: boolean;
  badge?: number;
}) => {
  const [search, setSearch] = useState("");
  const filteredOptions = searchable
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={selectedValues.length > 0 ? "default" : "outline"}
          size="sm"
          className={cn(
            "gap-1 whitespace-nowrap",
            selectedValues.length > 0 && "bg-primary/90 text-primary-foreground"
          )}
        >
          {label}
          {badge > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs bg-primary-foreground text-primary">
              {badge}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 bg-card border-border z-50" align="start">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <span className="font-medium text-sm">{label}</span>
          {selectedValues.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear} className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground">
              Clear all
            </Button>
          )}
        </div>
        {searchable && (
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>
        )}
        <ScrollArea className="max-h-60">
          <div className="p-2">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onToggle(option.value)}
                className={cn(
                  "w-full text-right px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between",
                  selectedValues.includes(option.value)
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
              >
                <span>{option.label}</span>
                {selectedValues.includes(option.value) && (
                  <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export function WorkOrdersCalendar({ requests, onRequestClick, categories = [] }: WorkOrdersCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("month");
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [notAssigned, setNotAssigned] = useState(false);
  const [overdueToday, setOverdueToday] = useState(false);

  const statusOptions = [
    { value: "Open", label: "Open" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "On Hold", label: "On Hold" },
    { value: "Pending", label: "Pending" },
    { value: "Scheduled", label: "Scheduled" },
  ];

  const priorityOptions = [
    { value: "urgent", label: "Urgent" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

  // Calculate active filters count
  const activeFiltersCount = statusFilter.length + priorityFilter.length + categoryFilter.length + 
    (assignedToMe ? 1 : 0) + (notAssigned ? 1 : 0) + (overdueToday ? 1 : 0);

  // Toggle filter value
  const toggleFilter = (filter: string[], setFilter: (v: string[]) => void, value: string) => {
    if (filter.includes(value)) {
      setFilter(filter.filter(v => v !== value));
    } else {
      setFilter([...filter, value]);
    }
  };

  // Get days for the calendar grid
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const weekStart = startOfWeek(start, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(end, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      if (statusFilter.length > 0 && !statusFilter.includes(request.status)) return false;
      if (priorityFilter.length > 0 && !priorityFilter.includes(request.priority || "")) return false;
      // Add more filter logic as needed
      return true;
    });
  }, [requests, statusFilter, priorityFilter]);

  // Group requests by date
  const requestsByDate = useMemo(() => {
    const grouped: Record<string, MaintenanceRequest[]> = {};
    
    filteredRequests.forEach(request => {
      const dateKey = format(new Date(request.created_at), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(request);
    });
    
    return grouped;
  }, [filteredRequests]);

  const navigatePrev = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const navigateNext = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <Button
          variant={activeFiltersCount > 0 ? "default" : "outline"}
          size="sm"
          className="gap-1"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs bg-primary-foreground text-primary">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        <FilterDropdown
          label="Status"
          options={statusOptions}
          selectedValues={statusFilter}
          onToggle={(v) => toggleFilter(statusFilter, setStatusFilter, v)}
          onClear={() => setStatusFilter([])}
          badge={statusFilter.length}
        />

        <FilterDropdown
          label="Priority"
          options={priorityOptions}
          selectedValues={priorityFilter}
          onToggle={(v) => toggleFilter(priorityFilter, setPriorityFilter, v)}
          onClear={() => setPriorityFilter([])}
        />

        <FilterDropdown
          label="Category"
          options={categoryOptions}
          selectedValues={categoryFilter}
          onToggle={(v) => toggleFilter(categoryFilter, setCategoryFilter, v)}
          onClear={() => setCategoryFilter([])}
          searchable
        />

        <Button
          variant={assignedToMe ? "default" : "outline"}
          size="sm"
          onClick={() => setAssignedToMe(!assignedToMe)}
        >
          Assigned to Me
        </Button>

        <Button
          variant={notAssigned ? "default" : "outline"}
          size="sm"
          onClick={() => setNotAssigned(!notAssigned)}
        >
          Not Assigned
        </Button>

        <Button
          variant={overdueToday ? "default" : "outline"}
          size="sm"
          onClick={() => setOverdueToday(!overdueToday)}
        >
          Overdue & Due Today
        </Button>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={navigatePrev}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy", { locale: ar })}
          </h2>
        </div>
        
        <div className="flex items-center border border-border rounded-md overflow-hidden">
          <Button
            variant={viewMode === "week" ? "default" : "ghost"}
            size="sm"
            className="rounded-none border-0"
            onClick={() => setViewMode("week")}
          >
            Week
          </Button>
          <Button
            variant={viewMode === "month" ? "default" : "ghost"}
            size="sm"
            className="rounded-none border-0"
            onClick={() => setViewMode("month")}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {/* Week days header */}
        <div className="grid grid-cols-7 bg-muted/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-sm font-medium text-muted-foreground border-b border-border"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayRequests = requestsByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[100px] p-2 border-b border-r border-border last:border-r-0 transition-colors",
                  !isCurrentMonth && "bg-muted/30",
                  isTodayDate && "bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                      !isCurrentMonth && "text-muted-foreground",
                      isTodayDate && "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Requests for this day */}
                <div className="space-y-1">
                  {dayRequests.slice(0, 3).map((request) => (
                    <button
                      key={request.id}
                      onClick={() => onRequestClick?.(request.id)}
                      className={cn(
                        "w-full text-left p-1 rounded text-xs truncate transition-colors",
                        "hover:opacity-80",
                        request.priority === "urgent" && "bg-destructive/20 text-destructive",
                        request.priority === "high" && "bg-orange-500/20 text-orange-600",
                        request.priority === "medium" && "bg-primary/20 text-primary",
                        request.priority === "low" && "bg-muted text-muted-foreground",
                        !request.priority && "bg-muted text-foreground"
                      )}
                    >
                      {request.title}
                    </button>
                  ))}
                  {dayRequests.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{dayRequests.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
