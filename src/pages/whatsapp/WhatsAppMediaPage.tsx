/**
 * صفحة وسائط WhatsApp
 * ====================
 * عرض وإدارة ملفات الوسائط من محادثات WhatsApp
 */

import { useState, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { 
  Image, 
  Video, 
  FileText, 
  Music, 
  Download, 
  Trash2, 
  Copy,
  Eye,
  Search,
  RefreshCw,
  Loader2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { useWhatsAppMedia, type MediaFile } from '@/modules/whatsapp';

// نوع الفلاتر
interface Filters {
  type: string;
  search: string;
  page: number;
  limit: number;
}

// أيقونة حسب نوع الملف
function FileTypeIcon({ type }: { type: string | null }) {
  const iconClass = "h-5 w-5";
  switch (type?.toLowerCase()) {
    case 'image':
      return <Image className={`${iconClass} text-green-600`} />;
    case 'video':
      return <Video className={`${iconClass} text-blue-600`} />;
    case 'document':
      return <FileText className={`${iconClass} text-orange-600`} />;
    case 'audio':
      return <Music className={`${iconClass} text-purple-600`} />;
    default:
      return <FileText className={`${iconClass} text-muted-foreground`} />;
  }
}

// شارة نوع الملف
function FileTypeBadge({ type }: { type: string | null }) {
  const getVariant = () => {
    switch (type?.toLowerCase()) {
      case 'image': return 'default';
      case 'video': return 'secondary';
      case 'document': return 'outline';
      case 'audio': return 'default';
      default: return 'outline';
    }
  };

  const getLabel = () => {
    switch (type?.toLowerCase()) {
      case 'image': return 'صورة';
      case 'video': return 'فيديو';
      case 'document': return 'مستند';
      case 'audio': return 'صوت';
      default: return type || 'غير معروف';
    }
  };

  return (
    <Badge variant={getVariant()} className="gap-1">
      <FileTypeIcon type={type} />
      {getLabel()}
    </Badge>
  );
}

// تنسيق حجم الملف
function formatFileSize(bytes: number | null): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function WhatsAppMediaPage() {
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    search: '',
    page: 1,
    limit: 20,
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { files, total, isLoading, refetch, deleteFile, isDeleting } = useWhatsAppMedia({
    page: filters.page,
    limit: filters.limit,
  });

  const totalPages = Math.ceil(total / filters.limit);

  // تصفية الملفات محلياً حسب النوع والبحث
  const filteredFiles = files.filter(file => {
    if (filters.type !== 'all' && file.file_type !== filters.type) return false;
    if (filters.search && !file.filename?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleCopyPhone = useCallback((phone: string | null) => {
    if (phone) {
      navigator.clipboard.writeText(phone);
      toast.success('تم نسخ رقم الهاتف');
    }
  }, []);

  const handleDownload = useCallback((file: MediaFile) => {
    if (file.meta_url) {
      window.open(file.meta_url, '_blank');
    } else {
      toast.error('الملف غير متاح للتحميل');
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (deleteId) {
      await deleteFile(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteFile]);

  return (
    <PageContainer maxWidth="7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">واتساب ميديا</h1>
          <p className="text-muted-foreground text-sm mt-1">
            تصفح المرفقات الإعلامية عبر جميع المحادثات. قم بتنزيل أو إزالة الوسائط دون حذف الرسالة الأصلية.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 ml-2" />
          )}
          تحديث
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث في الملفات..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="pr-10"
              />
            </div>

            {/* Type Filter */}
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters(f => ({ ...f, type: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="جميع الأنواع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="image">صور</SelectItem>
                <SelectItem value="video">فيديو</SelectItem>
                <SelectItem value="document">مستندات</SelectItem>
                <SelectItem value="audio">صوت</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range - Simplified */}
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الزمن</SelectItem>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">آخر 7 أيام</SelectItem>
                <SelectItem value="month">آخر 30 يوماً</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>الملفات ({total})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد ملفات</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">الرسالة</TableHead>
                  <TableHead>الملف</TableHead>
                  <TableHead>الحجم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>تم الاستلام</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">{file.message_id?.slice(0, 8) || '-'}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {file.from_phone || '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileTypeIcon type={file.file_type} />
                        <span className="truncate max-w-[200px]" title={file.filename || undefined}>
                          {file.filename || 'بدون اسم'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(file.file_size)}</TableCell>
                    <TableCell>
                      <FileTypeBadge type={file.file_type} />
                    </TableCell>
                    <TableCell>
                      {file.created_at ? (
                        <span className="text-sm">
                          {format(new Date(file.created_at), 'h:mma yyyy/M/d', { locale: ar })}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {file.meta_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreviewUrl(file.meta_url)}
                            title="معاينة"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyPhone(file.from_phone)}
                          title="نسخ الرقم"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(file)}
                          title="تحميل"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(file.id)}
                          title="حذف"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                صفحة {filters.page} من {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === 1}
                  onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === totalPages}
                  onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الملف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذا الملف نهائياً. لن يؤثر هذا على الرسالة الأصلية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
