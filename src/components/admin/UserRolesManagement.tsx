import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Trash2, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type AppRole = 'admin' | 'manager' | 'staff' | 'technician' | 'vendor' | 'customer' | 'dispatcher' | 'finance';

const AVAILABLE_ROLES: AppRole[] = ['admin', 'manager', 'staff', 'technician', 'vendor', 'customer', 'dispatcher', 'finance'];

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'مدير',
  manager: 'مشرف',
  staff: 'موظف',
  technician: 'فني',
  vendor: 'مورد',
  customer: 'عميل',
  dispatcher: 'منسق',
  finance: 'مالي',
};

export function UserRolesManagement() {
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');
  const [deleteTarget, setDeleteTarget] = useState<{ userId: string; role: AppRole } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all user roles
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['admin-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Search for users
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search-users', searchEmail],
    queryFn: async () => {
      if (!searchEmail || searchEmail.length < 3) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .ilike('email', `%${searchEmail}%`)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: searchEmail.length >= 3,
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة الدور للمستخدم',
      });
      setSelectedUserId(null);
      setSelectedRole('');
      setSearchEmail('');
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إضافة الدور',
        variant: 'destructive',
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-roles'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف الدور من المستخدم',
      });
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف الدور',
        variant: 'destructive',
      });
    },
  });

  const handleAddRole = () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار مستخدم ودور',
        variant: 'destructive',
      });
      return;
    }
    addRoleMutation.mutate({ userId: selectedUserId, role: selectedRole });
  };

  return (
    <div className="space-y-6">
      {/* Add Role Section */}
      <div className="border rounded-lg p-4 bg-card">
        <h3 className="font-semibold mb-4">إضافة دور لمستخدم</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">البحث عن مستخدم</label>
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="أدخل البريد الإلكتروني..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="pr-10"
              />
            </div>
            {isSearching && (
              <p className="text-sm text-muted-foreground">جاري البحث...</p>
            )}
            {searchResults && searchResults.length > 0 && (
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setSearchEmail(user.email);
                    }}
                    className="w-full text-right p-2 hover:bg-muted text-sm"
                  >
                    <div className="font-medium">{user.full_name || user.email}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">الدور</label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر دور" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleAddRole}
              disabled={!selectedUserId || !selectedRole || addRoleMutation.isPending}
              className="w-full"
            >
              {addRoleMutation.isPending ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="ml-2 h-4 w-4" />
              )}
              إضافة الدور
            </Button>
          </div>
        </div>
      </div>

      {/* Roles List */}
      <div>
        <h3 className="font-semibold mb-4">قائمة الأدوار الحالية</h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>تاريخ الإضافة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles?.map((userRole) => (
                  <TableRow key={`${userRole.user_id}-${userRole.role}`}>
                    <TableCell className="font-medium">
                      {userRole.profiles?.full_name || 'غير محدد'}
                    </TableCell>
                    <TableCell>{userRole.profiles?.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {ROLE_LABELS[userRole.role as AppRole]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(userRole.created_at).toLocaleDateString('ar-EG')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget({ userId: userRole.user_id, role: userRole.role as AppRole })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!userRoles || userRoles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      لا توجد أدوار محددة حاليًا
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الدور؟ قد يؤثر ذلك على صلاحيات المستخدم.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteRoleMutation.mutate(deleteTarget)}
              className="bg-destructive hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
