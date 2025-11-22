import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function ExpenseReport() {
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expenses, setExpenses] = useState<Array<{ amount?: number; category?: string; [key: string]: unknown }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', startDate)
        .lte('expense_date', endDate)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [startDate, endDate]);

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const maintenanceExpenses = expenses.filter(e => e.category === 'maintenance')
    .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const servicesExpenses = expenses.filter(e => e.category === 'services')
    .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const otherExpenses = expenses.filter(e => e.category === 'other')
    .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>تقارير المصروفات</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchExpenses} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">من تاريخ</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">إلى تاريخ</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الفترة</label>
              <Select defaultValue="custom">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">هذا الأسبوع</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                  <SelectItem value="custom">تخصيص</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">إجمالي المصروفات</p>
            <p className="text-2xl font-bold text-destructive">EGP {totalExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">مصروفات الصيانة</p>
            <p className="text-2xl font-bold text-warning">EGP {maintenanceExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">مصروفات الخدمات</p>
            <p className="text-2xl font-bold text-primary">EGP {servicesExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">عدد المعاملات</p>
            <p className="text-2xl font-bold text-foreground">{expenses.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Table */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص المصروفات</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد بيانات متاحة
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4">الفترة</th>
                    <th className="text-right py-3 px-4">مصروفات الصيانة</th>
                    <th className="text-right py-3 px-4">مصروفات الخدمات</th>
                    <th className="text-right py-3 px-4">مصروفات أخرى</th>
                    <th className="text-right py-3 px-4">إجمالي المصروفات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">
                      {format(new Date(startDate), 'dd/MM/yyyy', { locale: ar })} - {format(new Date(endDate), 'dd/MM/yyyy', { locale: ar })}
                    </td>
                    <td className="py-3 px-4">EGP {maintenanceExpenses.toFixed(2)}</td>
                    <td className="py-3 px-4">EGP {servicesExpenses.toFixed(2)}</td>
                    <td className="py-3 px-4">EGP {otherExpenses.toFixed(2)}</td>
                    <td className="py-3 px-4 font-semibold">EGP {totalExpenses.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
