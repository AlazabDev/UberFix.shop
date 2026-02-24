import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Trash2, ArrowRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const UFBOT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ufbot`;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'مرحباً! أنا **UFBot** 🤖 مساعدك الذكي لمنصة UberFix.\n\nيمكنني مساعدتك في:\n- 📋 الاستعلام عن طلبات الصيانة\n- 📊 عرض الإحصائيات\n- ❓ الإجابة عن أسئلتك\n- 🔧 شرح خدماتنا\n\nكيف يمكنني مساعدتك؟',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const streamChat = async (allMessages: { role: string; content: string }[]) => {
    const resp = await fetch(UFBOT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ messages: allMessages, session_id: 'fullpage' }),
    });

    if (!resp.ok || !resp.body) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || 'فشل الاتصال');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let assistantContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            assistantContent += delta;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant' && last.id.startsWith('stream-')) {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
              }
              return [...prev, { id: `stream-${Date.now()}`, content: assistantContent, role: 'assistant', timestamp: new Date() }];
            });
          }
        } catch { /* skip partial */ }
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();

    const userMsg: Message = { id: Date.now().toString(), content: message, role: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const chatHistory = [...messages, userMsg]
      .filter(m => m.id !== '1')
      .map(m => ({ role: m.role, content: m.content }));

    try {
      await streamChat(chatHistory);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      content: 'مرحباً! أنا **UFBot** 🤖 كيف يمكنني مساعدتك؟',
      role: 'assistant',
      timestamp: new Date()
    }]);
  };

  const exportChat = () => {
    const text = messages.map(m => {
      const time = m.timestamp.toLocaleString('ar-EG');
      const sender = m.role === 'user' ? '👤 أنت' : '🤖 UFBot';
      return `[${time}] ${sender}:\n${m.content}\n`;
    }).join('\n---\n\n');

    const blob = new Blob([`محادثة UFBot - ${new Date().toLocaleDateString('ar-EG')}\n${'='.repeat(50)}\n\n${text}`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ufbot-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "تم التصدير", description: "تم تحميل المحادثة بنجاح" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => navigate(-1)}
            aria-label="رجوع"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="bg-primary-foreground/20 rounded-full p-2">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">UFBot</h1>
            <p className="text-xs opacity-80">المساعد الذكي لـ UberFix</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20" onClick={exportChat} title="تصدير المحادثة">
            <Download className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20" onClick={clearChat} title="مسح المحادثة">
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex items-start gap-3", message.role === 'user' ? "justify-end" : "justify-start")}>
              {message.role === 'assistant' && (
                <div className="bg-primary text-primary-foreground rounded-full p-2 mt-0.5 shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <Card className={cn(
                "max-w-[75%] p-4 shadow-sm",
                message.role === 'user'
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card"
              )}>
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </Card>
              {message.role === 'user' && (
                <div className="bg-primary text-primary-foreground rounded-full p-2 mt-0.5 shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full p-2"><Bot className="h-4 w-4" /></div>
              <Card className="p-4 bg-card shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-background p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
