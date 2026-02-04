import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Edit, 
  Send, 
  Trash2, 
  Clock, 
  User, 
  Globe, 
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { TemplateStatusBadge, TemplateQualityBadge } from './TemplateStatusBadge';
import { TemplatePreview } from './TemplatePreview';
import type { WATemplate, TemplateEvent } from '@/hooks/useWhatsAppTemplates';

interface TemplateDetailsViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WATemplate | null;
  events: TemplateEvent[];
  isLoading: boolean;
  onEdit: () => void;
  onSubmit: () => void;
  onDelete: () => void;
  isSubmitting: boolean;
  isDeleting: boolean;
}

const eventTypeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  created: { label: 'تم الإنشاء', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600' },
  updated: { label: 'تم التحديث', icon: <Edit className="h-4 w-4" />, color: 'text-blue-600' },
  submitted: { label: 'تم الإرسال للموافقة', icon: <Send className="h-4 w-4" />, color: 'text-blue-600' },
  meta_accepted: { label: 'تم استلام الطلب', icon: <CheckCircle className="h-4 w-4" />, color: 'text-blue-600' },
  status_update: { label: 'تغيير الحالة', icon: <AlertCircle className="h-4 w-4" />, color: 'text-yellow-600' },
  status_change: { label: 'تغيير الحالة', icon: <AlertCircle className="h-4 w-4" />, color: 'text-yellow-600' },
  quality_update: { label: 'تغيير الجودة', icon: <AlertCircle className="h-4 w-4" />, color: 'text-orange-600' },
  quality_change: { label: 'تغيير الجودة', icon: <AlertCircle className="h-4 w-4" />, color: 'text-orange-600' },
  category_update: { label: 'تغيير الفئة', icon: <Tag className="h-4 w-4" />, color: 'text-purple-600' },
  submit_failed: { label: 'فشل الإرسال', icon: <XCircle className="h-4 w-4" />, color: 'text-red-600' },
  submit_error: { label: 'خطأ في الإرسال', icon: <XCircle className="h-4 w-4" />, color: 'text-red-600' },
  deleted: { label: 'تم الحذف', icon: <Trash2 className="h-4 w-4" />, color: 'text-red-600' },
  synced: { label: 'تمت المزامنة', icon: <RotateCcw className="h-4 w-4" />, color: 'text-green-600' },
  imported: { label: 'تم الاستيراد', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600' },
};

const eventSourceLabels: Record<string, string> = {
  user: 'المستخدم',
  meta_webhook: 'Meta Webhook',
  meta_api: 'Meta API',
  meta_sync: 'مزامنة Meta',
  system: 'النظام',
};

export function TemplateDetailsView({
  open,
  onOpenChange,
  template,
  events,
  isLoading,
  onEdit,
  onSubmit,
  onDelete,
  isSubmitting,
  isDeleting,
}: TemplateDetailsViewProps) {
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  if (!template && !isLoading) return null;

  const canEdit = template && !template.is_locked;
  const canSubmit = template && ['draft', 'rejected'].includes(template.status);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-full sm:max-w-xl p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle className="flex items-center justify-between">
              <span>تفاصيل القالب</span>
              {template && (
                <TemplateStatusBadge 
                  status={template.status} 
                  reason={template.rejection_reason}
                />
              )}
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-6 space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : template ? (
                <>
                  {/* Template Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-mono text-lg font-semibold">{template.name}</h3>
                      {template.meta_template_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Meta ID: {template.meta_template_id}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Tag className="h-3 w-3" />
                        {template.category === 'utility' && 'أداة مساعدة'}
                        {template.category === 'marketing' && 'تسويق'}
                        {template.category === 'authentication' && 'مصادقة'}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Globe className="h-3 w-3" />
                        {template.language === 'ar' ? 'العربية' : template.language}
                      </Badge>
                      <TemplateQualityBadge 
                        quality={template.quality} 
                        reason={template.quality_reason}
                      />
                    </div>

                    {/* Rejection Reason Banner */}
                    {template.rejection_reason && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                          <div>
                            <p className="font-medium text-destructive">سبب الرفض</p>
                            <p className="text-sm text-destructive/80 mt-1">
                              {template.rejection_reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Preview */}
                  <TemplatePreview template={template} />

                  <Separator />

                  {/* Timestamps */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>تم الإنشاء:</span>
                      <span className="text-foreground">
                        {format(new Date(template.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                      </span>
                    </div>
                    {template.submitted_at && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Send className="h-4 w-4" />
                        <span>تم الإرسال:</span>
                        <span className="text-foreground">
                          {format(new Date(template.submitted_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                        </span>
                      </div>
                    )}
                    {template.approved_at && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>تم الاعتماد:</span>
                        <span>
                          {format(new Date(template.approved_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                        </span>
                      </div>
                    )}
                    {template.rejected_at && (
                      <div className="flex items-center gap-2 text-destructive">
                        <XCircle className="h-4 w-4" />
                        <span>تم الرفض:</span>
                        <span>
                          {format(new Date(template.rejected_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Audit Log / Timeline */}
                  <div>
                    <h4 className="font-semibold mb-4">سجل الأحداث</h4>
                    {events.length === 0 ? (
                      <p className="text-sm text-muted-foreground">لا توجد أحداث مسجلة</p>
                    ) : (
                      <div className="space-y-3">
                        {events.slice(0, 10).map((event) => {
                          const config = eventTypeLabels[event.event_type] || {
                            label: event.event_type,
                            icon: <AlertCircle className="h-4 w-4" />,
                            color: 'text-gray-600',
                          };
                          return (
                            <div key={event.id} className="flex gap-3 text-sm">
                              <div className={`mt-0.5 ${config.color}`}>{config.icon}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{config.label}</span>
                                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                                    {eventSourceLabels[event.event_source] || event.event_source}
                                  </Badge>
                                </div>
                                {event.old_status && event.new_status && (
                                  <p className="text-muted-foreground">
                                    {event.old_status} → {event.new_status}
                                  </p>
                                )}
                                {event.old_quality && event.new_quality && (
                                  <p className="text-muted-foreground">
                                    الجودة: {event.old_quality} → {event.new_quality}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(event.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {canEdit && (
                      <Button variant="outline" onClick={onEdit}>
                        <Edit className="h-4 w-4 ml-2" />
                        تعديل
                      </Button>
                    )}
                    {canSubmit && (
                      <Button onClick={() => setShowSubmitConfirm(true)} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 ml-2" />
                        )}
                        {template.status === 'rejected' ? 'إعادة الإرسال' : 'إرسال للموافقة'}
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      onClick={onDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 ml-2" />
                      )}
                      حذف
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إرسال القالب للموافقة</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>سيتم إرسال القالب التالي للموافقة من Meta:</p>
              {template && (
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <p><strong>الاسم:</strong> {template.name}</p>
                  <p><strong>الفئة:</strong> {template.category}</p>
                  <p><strong>اللغة:</strong> {template.language}</p>
                </div>
              )}
              <p className="text-destructive">
                ⚠️ بعد الإرسال، لن تتمكن من تعديل بعض الحقول إلا عبر إنشاء نسخة جديدة.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onSubmit();
                setShowSubmitConfirm(false);
              }}
            >
              إرسال للموافقة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
