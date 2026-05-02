import { useState } from 'react';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { openWhatsApp } from '@/config/whatsapp';

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** UUID أو request_number — يُمرَّر للدالة الآمنة */
  requestKey: string;
  requestNumber?: string;
  onRated?: (rating: number) => void;
}

const LABELS = ['', 'سيئ', 'مقبول', 'جيد', 'ممتاز', 'رائع جداً'];

export function RatingDialog({
  open,
  onOpenChange,
  requestKey,
  requestNumber,
  onRated,
}: RatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    if (rating < 1) {
      toast({ title: 'اختر تقييماً', description: 'يرجى اختيار من 1 إلى 5 نجوم', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('public_submit_rating' as any, {
        query_text: requestKey,
        rating_value: rating,
        comment_text: comment || null,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string };
      if (!result?.success) {
        const msg =
          result?.error === 'already_rated'
            ? 'تم تقييم هذا الطلب من قبل'
            : result?.error === 'request_not_completed'
            ? 'لا يمكن التقييم قبل إنجاز الطلب'
            : result?.error === 'request_not_found'
            ? 'الطلب غير موجود'
            : 'تعذر إرسال التقييم';
        toast({ title: 'خطأ', description: msg, variant: 'destructive' });
        return;
      }
      setDone(true);
      onRated?.(rating);
      toast({ title: 'شكراً لتقييمك ✓', description: 'رأيك يساعدنا على التحسّن' });
      // إرسال شكر عبر واتساب اختياري
      setTimeout(() => onOpenChange(false), 1600);
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message || 'تعذر إرسال التقييم', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const sendWhatsAppThanks = () => {
    openWhatsApp(
      `تم تقييم الطلب ${requestNumber || ''} بـ ${rating} نجوم${comment ? `\nالتعليق: ${comment}` : ''}`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">قيّم خدمتنا</DialogTitle>
          <DialogDescription className="text-center">
            رأيك مهم لنا — كيف كانت تجربتك مع هذا الطلب؟
            {requestNumber && (
              <span className="block mt-1 font-mono text-xs text-muted-foreground">
                {requestNumber}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-semibold">شكراً لتقييمك!</p>
            <p className="text-sm text-muted-foreground mt-1">سعداء بخدمتك</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={sendWhatsAppThanks}>
              مشاركة عبر واتساب
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = (hover || rating) >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(n)}
                      className="transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB900] rounded p-1"
                      aria-label={`${n} نجوم`}
                    >
                      <Star
                        className={`h-9 w-9 transition-colors ${
                          active ? 'fill-[#FFB900] text-[#FFB900]' : 'text-muted-foreground/40'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-sm font-medium h-5 text-[#030957]">
                {LABELS[hover || rating] || ''}
              </p>
              <Textarea
                placeholder="اكتب تعليقاً (اختياري)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={500}
                className="resize-none"
              />
            </div>

            <DialogFooter className="flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                لاحقاً
              </Button>
              <Button
                onClick={submit}
                disabled={submitting || rating < 1}
                className="flex-1 bg-[#FFB900] text-[#030957] hover:bg-[#FFB900]/90 font-bold"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'إرسال التقييم'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default RatingDialog;