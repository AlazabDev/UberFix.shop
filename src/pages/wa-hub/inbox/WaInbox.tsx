import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Send, Plus, Phone, BellOff, Eye, X,
  MessageSquare, Clock, Users as UsersIcon
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function WaInbox() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: conversations } = useQuery({
    queryKey: ["wa-inbox-conversations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("wa_conversations")
        .select("*, wa_contacts(*)")
        .order("last_message_at", { ascending: false });
      return data || [];
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["wa-inbox-messages", selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const { data } = await supabase
        .from("wa_messages")
        .select("*")
        .eq("conversation_id", selectedConversation)
        .order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!selectedConversation,
  });

  const selectedConv = conversations?.find(c => c.id === selectedConversation);
  const contact = selectedConv?.wa_contacts;

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div className="h-screen flex" dir="rtl">
      {/* Conversations List */}
      <div className="w-80 border-l border-border flex flex-col bg-card">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">صندوق الوارد</h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7"><BellOff className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="ابحث عن أرقام الهواتف..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pr-9 h-9" />
          </div>
        </div>

        <div className="p-2 border-b border-border space-y-2">
          <Button variant="outline" className="w-full justify-between h-9 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>جميع أرقام واتساب</span>
            </div>
          </Button>
          <div className="flex gap-2">
            <Select defaultValue="active">
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="all">الكل</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الموكلين إ...</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {(!conversations || conversations.length === 0) ? (
            <div className="p-6 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا توجد محادثات</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={cn(
                  "w-full p-3 text-right border-b border-border hover:bg-muted/50 transition-colors",
                  selectedConversation === conv.id && "bg-muted"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(conv.wa_contacts?.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{conv.wa_contacts?.display_name || conv.wa_contacts?.phone || "—"}</p>
                      <span className="text-xs text-muted-foreground">
                        {conv.last_message_at
                          ? formatDistanceToNow(new Date(conv.last_message_at), { locale: ar, addSuffix: true })
                          : "—"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">آخر رسالة...</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] text-muted-foreground">• نشط</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">اختر محادثة للبدء</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(contact?.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{contact?.display_name || "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    نشط • {contact?.phone || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">معلومات</Button>
                <Button variant="ghost" size="sm">إغلاق</Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3 max-w-3xl mx-auto">
                {messages?.map(msg => (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[70%] p-3 rounded-lg text-sm",
                      msg.direction === "in"
                        ? "bg-muted ml-auto"
                        : "bg-primary/10 mr-auto"
                    )}
                  >
                    <p>{msg.body || (msg.msg_type !== "text" ? `[${msg.msg_type}]` : "—")}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                ))}
                {(!messages || messages.length === 0) && (
                  <p className="text-center text-muted-foreground text-sm py-12">لا توجد رسائل</p>
                )}
              </div>
            </ScrollArea>

            {/* Manual mode notice */}
            <div className="px-4 py-1 border-t border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> الوضع اليدوي
              </p>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2 items-end">
                <Textarea
                  placeholder="اكتب رسالتك..."
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  className="min-h-[60px] resize-none flex-1"
                  rows={2}
                />
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Plus className="h-5 w-5" />
                  </Button>
                  <Button size="icon" className="h-9 w-9 bg-green-600 hover:bg-green-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Contact Info Panel */}
      {selectedConversation && contact && (
        <div className="w-72 border-r border-border bg-card flex flex-col">
          <div className="border-b border-border">
            <Tabs defaultValue="info">
              <TabsList className="w-full justify-start rounded-none bg-transparent border-b-0">
                <TabsTrigger value="page">صفحة</TabsTrigger>
                <TabsTrigger value="info">معلومات</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="text-center mb-6">
              <Avatar className="h-16 w-16 mx-auto mb-3">
                <AvatarFallback className="bg-muted text-lg">
                  {getInitials(contact.display_name)}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium">{contact.display_name || "—"}</p>
              <p className="text-sm text-muted-foreground font-mono">{contact.phone}</p>
              <div className="flex gap-2 mt-3 justify-center">
                <Button variant="outline" size="sm">عرض المحادثات</Button>
                <Button variant="outline" size="sm">+ إضافة ملاحظة</Button>
              </div>
            </div>

            {/* Assignment */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">التعيين</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <UsersIcon className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">لم يتم تعيينه</p>
            </div>

            {/* Status */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" /> الحالة
              </p>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">نشط</Badge>
            </div>

            {/* Activity */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" /> النشاط
              </p>
              <p className="text-sm text-muted-foreground">
                آخر مرة نشطة: {contact.last_seen_at
                  ? formatDistanceToNow(new Date(contact.last_seen_at), { locale: ar, addSuffix: true })
                  : "غير معروف"}
              </p>
              <p className="text-sm text-muted-foreground">إجمالي الرسائل: —</p>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
