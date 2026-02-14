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
} from 'lucide-react';
import { TemplateStatusBadge } from './TemplateStatusBadge';
import type { WATemplate, TemplateCategory } from '@/hooks/useWhatsAppTemplates';

interface TemplatesTableProps {
  templates: WATemplate[];
  isLoading: boolean;
  onView: (template: WATemplate) => void;
  onEdit: (template: WATemplate) => void;
  onSubmit: (template: WATemplate) => void;
  onDelete: (template: WATemplate) => void;
  onSendTest: (template: WATemplate) => void;
}

const categoryLabels: Record<TemplateCategory, string> = {
  utility: 'UTILITY',
  marketing: 'MARKETING',
  authentication: 'AUTHENTICATION',
};

const languageLabels: Record<string, string> = {
  ar: 'ar',
  en: 'en',
  en_US: 'en_US',
};

// Count params in template body
function countParams(text: string | null | undefined): number {
  if (!text) return 0;
  const matches = text.match(/\{\{\d+\}\}/g);
  return matches ? matches.length : 0;
}

// Truncate preview text
function previewText(template: WATemplate): string {
  const body = template.body_text || '';
  return body.length > 60 ? body.slice(0, 60) + '...' : body;
}

export function TemplatesTable({
  templates,
  isLoading,
  onView,
  onEdit,
  onSubmit,
  onDelete,
  onSendTest,
}: TemplatesTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<WATemplate | null>(null);

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">Name</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Category</TableHead>
              <TableHead className="text-right">Language</TableHead>
              <TableHead className="text-right">Preview</TableHead>
              <TableHead className="text-center w-12"></TableHead>
              <TableHead className="text-center w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-6 w-6 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-6 w-6 mx-auto" /></TableCell>
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
              <TableHead className="text-right font-semibold">Name</TableHead>
              <TableHead className="text-right font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Category</TableHead>
              <TableHead className="text-right font-semibold">Language</TableHead>
              <TableHead className="text-right font-semibold">Preview</TableHead>
              <TableHead className="text-center w-12"></TableHead>
              <TableHead className="text-center w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow 
                key={template.id} 
                className="hover:bg-muted/30 cursor-pointer"
                onClick={() => onView(template)}
              >
                {/* Name + params + meta ID */}
                <TableCell>
                  <div>
                    <p className="font-semibold text-sm">{template.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {countParams(template.body_text)} params
                      {template.meta_template_id && ` · ${template.meta_template_id.slice(0, 10)}...`}
                    </p>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <TemplateStatusBadge 
                    status={template.status} 
                    reason={template.rejection_reason}
                  />
                </TableCell>

                {/* Category */}
                <TableCell>
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {categoryLabels[template.category] || template.category}
                  </span>
                </TableCell>

                {/* Language */}
                <TableCell>
                  <span className="text-sm">
                    {languageLabels[template.language] || template.language}
                  </span>
                </TableCell>

                {/* Preview */}
                <TableCell className="max-w-[250px]">
                  <p className="text-sm text-muted-foreground truncate" dir="rtl">
                    {previewText(template)}
                  </p>
                </TableCell>

                {/* Send Test */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={template.status !== 'approved'}
                    onClick={() => onSendTest(template)}
                    title="إرسال اختبار"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TableCell>

                {/* Actions Menu */}
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

                      {template.status === 'approved' && (
                        <DropdownMenuItem onClick={() => onSendTest(template)}>
                          <Send className="h-4 w-4 ml-2" />
                          إرسال اختبار
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
