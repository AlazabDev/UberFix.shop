import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Send, 
  RotateCcw, 
  Trash2,
  PauseCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { TemplateStatusBadge, TemplateQualityBadge } from './TemplateStatusBadge';
import type { WATemplate, TemplateCategory } from '@/hooks/useWhatsAppTemplates';

interface TemplatesTableProps {
  templates: WATemplate[];
  isLoading: boolean;
  onView: (template: WATemplate) => void;
  onEdit: (template: WATemplate) => void;
  onSubmit: (template: WATemplate) => void;
  onDelete: (template: WATemplate) => void;
}

const categoryLabels: Record<TemplateCategory, string> = {
  utility: 'أداة مساعدة',
  marketing: 'تسويق',
  authentication: 'مصادقة',
};

const languageLabels: Record<string, string> = {
  ar: 'العربية',
  en: 'English',
  en_US: 'English (US)',
};

export function TemplatesTable({
  templates,
  isLoading,
  onView,
  onEdit,
  onSubmit,
  onDelete,
}: TemplatesTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<WATemplate | null>(null);

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">الفئة</TableHead>
              <TableHead className="text-right">اللغة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الجودة</TableHead>
              <TableHead className="text-right">آخر تحديث</TableHead>
              <TableHead className="text-center w-20">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 mx-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <div className="text-muted-foreground">
          <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">لا توجد قوالب</h3>
          <p className="text-sm">ابدأ بإنشاء قالب جديد أو قم بمزامنة القوالب من Meta</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right font-semibold">الاسم</TableHead>
              <TableHead className="text-right font-semibold">الفئة</TableHead>
              <TableHead className="text-right font-semibold">اللغة</TableHead>
              <TableHead className="text-right font-semibold">الحالة</TableHead>
              <TableHead className="text-right font-semibold">الجودة</TableHead>
              <TableHead className="text-right font-semibold">آخر تحديث</TableHead>
              <TableHead className="text-center w-20 font-semibold">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow 
                key={template.id} 
                className="hover:bg-muted/30 cursor-pointer"
                onClick={() => onView(template)}
              >
                <TableCell className="font-medium">
                  <div>
                    <p className="font-mono text-sm">{template.name}</p>
                    {template.meta_template_id && (
                      <p className="text-xs text-muted-foreground">
                        Meta ID: {template.meta_template_id.slice(0, 12)}...
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {categoryLabels[template.category] || template.category}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {languageLabels[template.language] || template.language}
                  </span>
                </TableCell>
                <TableCell>
                  <TemplateStatusBadge 
                    status={template.status} 
                    reason={template.rejection_reason}
                  />
                </TableCell>
                <TableCell>
                  <TemplateQualityBadge 
                    quality={template.quality} 
                    reason={template.quality_reason}
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(template.updated_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(template)}>
                        <Eye className="h-4 w-4 ml-2" />
                        عرض
                      </DropdownMenuItem>
                      
                      {!template.is_locked && (
                        <DropdownMenuItem onClick={() => onEdit(template)}>
                          <Edit className="h-4 w-4 ml-2" />
                          تعديل
                        </DropdownMenuItem>
                      )}

                      {['draft', 'rejected'].includes(template.status) && (
                        <DropdownMenuItem onClick={() => onSubmit(template)}>
                          <Send className="h-4 w-4 ml-2" />
                          إرسال للموافقة
                        </DropdownMenuItem>
                      )}

                      {template.status === 'rejected' && (
                        <DropdownMenuItem onClick={() => onSubmit(template)}>
                          <RotateCcw className="h-4 w-4 ml-2" />
                          إعادة الإرسال
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem 
                        onClick={() => setDeleteConfirm(template)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف القالب</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف القالب "{deleteConfirm?.name}"؟
              {deleteConfirm?.meta_template_id && (
                <span className="block mt-2 text-destructive">
                  سيتم حذف القالب من Meta أيضاً.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  onDelete(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
