import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  MessageCircle,
  Send,
  Loader2,
  ArrowRight,
  User,
  Wrench,
} from 'lucide-react';
import { useChat, ChatConversation, ChatMessage } from '@/hooks/useChat';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const ChatPage = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    messages,
    loading,
    currentUserId,
    sendMessage,
  } = useChat(selectedConversationId || undefined);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim()) return;
    const success = await sendMessage(messageText);
    if (success) setMessageText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getOtherPartyName = (conv: ChatConversation) => {
    if (currentUserId === conv.customer_id) return conv.technician_name || 'فني';
    return conv.customer_name || 'عميل';
  };

  const getOtherPartyIcon = (conv: ChatConversation) => {
    if (currentUserId === conv.customer_id) return <Wrench className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            الدردشة
          </h1>
          <p className="text-sm text-muted-foreground">تواصل مباشر بين الفنيين والعملاء</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-160px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 flex flex-col">
            <div className="p-3 border-b">
              <h2 className="font-semibold text-sm">المحادثات</h2>
            </div>
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                  <MessageCircle className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">لا توجد محادثات</p>
                  <p className="text-xs text-muted-foreground mt-1">ابدأ محادثة من خريطة الخدمات أو من طلب صيانة</p>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversationId(conv.id)}
                      className={`w-full text-right p-3 hover:bg-muted/50 transition-colors ${
                        selectedConversationId === conv.id ? 'bg-primary/5 border-r-2 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getOtherPartyIcon(conv)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">{getOtherPartyName(conv)}</p>
                            {conv.unread_count && conv.unread_count > 0 ? (
                              <Badge variant="default" className="text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
                                {conv.unread_count}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{conv.last_message || 'بدء المحادثة...'}</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                            {format(new Date(conv.last_message_at), 'dd MMM • HH:mm', { locale: ar })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversationId ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-8 w-8"
                    onClick={() => setSelectedConversationId(null)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getOtherPartyIcon(conversations.find(c => c.id === selectedConversationId)!)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {getOtherPartyName(conversations.find(c => c.id === selectedConversationId)!)}
                    </p>
                    <p className="text-xs text-muted-foreground">متصل</p>
                  </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    const isSystem = msg.sender_type === 'system';
                    
                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            {msg.message}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            isMe
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {format(new Date(msg.created_at), 'HH:mm')}
                            {isMe && msg.is_read && ' ✓✓'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input */}
                <div className="p-3 border-t">
                  <div className="flex items-center gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="اكتب رسالتك..."
                      className="flex-1"
                    />
                    <Button size="icon" onClick={handleSend} disabled={!messageText.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-1">اختر محادثة</h3>
                <p className="text-sm text-muted-foreground">
                  اختر محادثة من القائمة أو ابدأ محادثة جديدة من خريطة الخدمات
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
