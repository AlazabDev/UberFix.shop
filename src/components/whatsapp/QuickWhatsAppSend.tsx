import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { useWhatsAppNotifications } from '@/hooks/useWhatsAppNotifications';

interface QuickWhatsAppSendProps {
  defaultPhone?: string;
  requestId?: string;
  className?: string;
}

/**
 * مكون إرسال رسالة WhatsApp سريعة
 */
export function QuickWhatsAppSend({
  defaultPhone = '',
  requestId,
  className
}: QuickWhatsAppSendProps) {
  const [phone, setPhone] = useState(defaultPhone);
  const [message, setMessage] = useState('');
  const { sendCustomMessage, loading } = useWhatsAppNotifications();

  const handleSend = async () => {
    if (!phone || !message.trim()) return;
    
    const result = await sendCustomMessage(phone, message.trim(), requestId);
    if (result.success) {
      setMessage('');
    }
  };

  const quickMessages = [
    'مرحباً، كيف يمكننا مساعدتك؟',
    'سيتم التواصل معك قريباً لتحديد الموعد.',
    'شكراً لتواصلك مع UberFix!',
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          إرسال WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            placeholder="رقم الهاتف (مثال: 01234567890)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            dir="ltr"
            className="text-left"
          />
        </div>

        <div>
          <Textarea
            placeholder="اكتب رسالتك هنا..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>

        {/* رسائل سريعة */}
        <div className="flex flex-wrap gap-2">
          {quickMessages.map((msg, idx) => (
            <Button
              key={idx}
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1"
              onClick={() => setMessage(msg)}
            >
              {msg.slice(0, 25)}...
            </Button>
          ))}
        </div>

        <Button
          onClick={handleSend}
          disabled={loading || !phone || !message.trim()}
          className="w-full gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          إرسال
        </Button>
      </CardContent>
    </Card>
  );
}
