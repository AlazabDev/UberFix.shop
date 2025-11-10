import { useState } from 'react';
import { WhatsAppMessagesTable } from '@/components/whatsapp/WhatsAppMessagesTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { MessageSquare, Send } from 'lucide-react';

export default function WhatsAppMessages() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const { sendWhatsAppMessage, isSending } = useWhatsApp();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !message) {
      return;
    }

    try {
      await sendWhatsAppMessage({
        to: phoneNumber,
        message: message,
      });
      
      // Clear form
      setPhoneNumber('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">إدارة رسائل WhatsApp</h1>
          <p className="text-muted-foreground">إرسال وتتبع رسائل WhatsApp</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إرسال رسالة جديدة</CardTitle>
          <CardDescription>أرسل رسالة WhatsApp إلى رقم هاتف</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">رقم الهاتف</label>
              <Input
                type="tel"
                placeholder="+20xxxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">
                مثال: +201234567890 (يجب أن يبدأ بـ +)
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">الرسالة</label>
              <Textarea
                placeholder="اكتب رسالتك هنا..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <Button type="submit" disabled={isSending || !phoneNumber || !message}>
              <Send className="h-4 w-4 ml-2" />
              {isSending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>سجل الرسائل</CardTitle>
          <CardDescription>جميع رسائل WhatsApp المرسلة مع حالاتها</CardDescription>
        </CardHeader>
        <CardContent>
          <WhatsAppMessagesTable />
        </CardContent>
      </Card>
    </div>
  );
}
