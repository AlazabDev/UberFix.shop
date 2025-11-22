import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, MapPin, Loader2 } from 'lucide-react';

interface Branch {
  id: string;
  branch: string;
  address: string | null;
  branch_type: string | null;
  link: string | null;
  icon: string | null;
  latitude: string | null;
  longitude: string | null;
}

export default function BranchManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    branch: '',
    address: '',
    branch_type: '',
    link: '',
    icon: '',
    latitude: '',
    longitude: '',
  });

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branch_locations')
        .select('*')
        .order('branch');
      
      if (error) throw error;
      return data as Branch[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newBranch: typeof formData) => {
      const { error } = await supabase
        .from('branch_locations')
        .insert([newBranch]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({ title: '✅ تم إضافة الفرع بنجاح' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ 
        title: '❌ خطأ في إضافة الفرع', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedBranch: typeof formData) => {
      const { error } = await supabase
        .from('branch_locations')
        .update(updatedBranch)
        .eq('id', updatedBranch.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({ title: '✅ تم تحديث الفرع بنجاح' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ 
        title: '❌ خطأ في تحديث الفرع', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('branch_locations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({ title: '✅ تم حذف الفرع بنجاح' });
    },
    onError: (error: any) => {
      toast({ 
        title: '❌ خطأ في حذف الفرع', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBranch(null);
    setFormData({
      id: '',
      branch: '',
      address: '',
      branch_type: '',
      link: '',
      icon: '',
      latitude: '',
      longitude: '',
    });
  };

  const handleOpenDialog = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        id: branch.id,
        branch: branch.branch,
        address: branch.address || '',
        branch_type: branch.branch_type || '',
        link: branch.link || '',
        icon: branch.icon || '',
        latitude: branch.latitude || '',
        longitude: branch.longitude || '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id || !formData.branch) {
      toast({ 
        title: '⚠️ بيانات ناقصة', 
        description: 'يرجى ملء الحقول المطلوبة',
        variant: 'destructive' 
      });
      return;
    }

    if (editingBranch) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          toast({ title: '✅ تم تحديد الموقع الحالي' });
        },
        (error) => {
          toast({ 
            title: '❌ خطأ في تحديد الموقع', 
            description: error.message,
            variant: 'destructive' 
          });
        }
      );
    } else {
      toast({ 
        title: '❌ الموقع غير مدعوم', 
        description: 'المتصفح لا يدعم خدمة تحديد الموقع',
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">إدارة الفروع</CardTitle>
              <CardDescription className="mt-2">
                إضافة وتعديل فروع الشركة على الخريطة (العدد الحالي: {branches.length})
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة فرع جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="id">كود الفرع *</Label>
                      <Input
                        id="id"
                        value={formData.id}
                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                        placeholder="مثال: BR001"
                        disabled={!!editingBranch}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="branch">اسم الفرع *</Label>
                      <Input
                        id="branch"
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        placeholder="مثال: فرع المعادي"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="العنوان الكامل"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="branch_type">نوع الفرع</Label>
                      <Input
                        id="branch_type"
                        value={formData.branch_type}
                        onChange={(e) => setFormData({ ...formData, branch_type: e.target.value })}
                        placeholder="مثال: محل تجاري، مركز خدمة"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="icon">رمز الأيقونة</Label>
                      <Input
                        id="icon"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="URL للأيقونة"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link">رابط خرائط جوجل</Label>
                    <Input
                      id="link"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">خط العرض (Latitude)</Label>
                      <Input
                        id="latitude"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        placeholder="30.0444"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="longitude">خط الطول (Longitude)</Label>
                      <Input
                        id="longitude"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        placeholder="31.2357"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetCurrentLocation}
                    className="w-full gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    استخدام الموقع الحالي
                  </Button>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDialog}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {(createMutation.isPending || updateMutation.isPending) && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editingBranch ? 'تحديث' : 'إضافة'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد فروع حالياً. قم بإضافة فرع جديد للبدء.
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الكود</TableHead>
                    <TableHead>اسم الفرع</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الموقع</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-mono text-sm">{branch.id}</TableCell>
                      <TableCell className="font-medium">{branch.branch}</TableCell>
                      <TableCell className="max-w-xs truncate">{branch.address || '-'}</TableCell>
                      <TableCell>{branch.branch_type || '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {branch.latitude && branch.longitude ? (
                          <span className="font-mono">
                            {parseFloat(branch.latitude).toFixed(4)}, {parseFloat(branch.longitude).toFixed(4)}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(branch)}
                            className="gap-1"
                          >
                            <Pencil className="w-3 h-3" />
                            تعديل
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف "${branch.branch}"؟`)) {
                                deleteMutation.mutate(branch.id);
                              }
                            }}
                            className="gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            حذف
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
