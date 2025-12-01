import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Filter, RotateCcw, Eye, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useProperties } from "@/hooks/useProperties";

export default function MaintenanceList() {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedProperty, selectedStatus, dateFilter, requests]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      toast.error("فشل تحميل الطلبات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Property filter
    if (selectedProperty) {
      filtered = filtered.filter(req => req.property_id === selectedProperty);
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(req => req.status === selectedStatus);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(req => {
        const reqDate = new Date(req.created_at).toISOString().split('T')[0];
        return reqDate === dateFilter;
      });
    }

    setFilteredRequests(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedProperty("");
    setSelectedStatus("");
    setDateFilter("");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "Completed": "bg-green-500",
      "In Progress": "bg-blue-500",
      "Open": "bg-yellow-500",
      "Cancelled": "bg-red-500",
      "Archived": "bg-gray-500"
    };
    return <Badge className={variants[status] || "bg-gray-500"}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة طلبات الصيانة</h1>
          <p className="text-muted-foreground">عرض وإدارة جميع طلبات الصيانة</p>
        </div>
        <Button onClick={() => navigate("/maintenance/create")}>
          <Plus className="h-4 w-4 ml-2" />
          طلب جديد
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Property Filter */}
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger>
                <SelectValue placeholder="العقار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع العقارات</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الحالات</SelectItem>
                <SelectItem value="Open">مفتوح</SelectItem>
                <SelectItem value="In Progress">قيد التنفيذ</SelectItem>
                <SelectItem value="Completed">مكتمل</SelectItem>
                <SelectItem value="Cancelled">ملغي</SelectItem>
                <SelectItem value="Archived">مؤرشف</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />

            {/* Reset Button */}
            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4 ml-2" />
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد طلبات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3">رقم الطلب</th>
                    <th className="text-right p-3">الوصف</th>
                    <th className="text-right p-3">التاريخ</th>
                    <th className="text-right p-3">العقار</th>
                    <th className="text-right p-3">الحالة</th>
                    <th className="text-right p-3">الفني المعين</th>
                    <th className="text-right p-3">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono text-sm">
                        {request.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-semibold">{request.title || "بدون عنوان"}</p>
                          {request.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {request.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(request.created_at).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="p-3">
                        {request.property_id ? (
                          <span className="text-sm">
                            {properties.find(p => p.id === request.property_id)?.name || "عقار محدد"}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3">{getStatusBadge(request.status)}</td>
                      <td className="p-3">
                        {request.assigned_vendor_id ? (
                          <span className="text-sm">فني معين</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">غير معين</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Link to={`/maintenance/${request.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 ml-2" />
                            عرض
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
