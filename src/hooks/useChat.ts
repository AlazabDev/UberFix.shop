import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatConversation {
  id: string;
  request_id: string | null;
  customer_id: string;
  technician_id: string | null;
  status: string;
  last_message_at: string;
  created_at: string;
  // joined data
  technician_name?: string;
  customer_name?: string;
  last_message?: string;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'customer' | 'technician' | 'system';
  message: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  file_url: string | null;
  is_read: boolean;
  created_at: string;
}

export const useChat = (conversationId?: string) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from('chat_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Enrich with names
      const enriched = await Promise.all((data || []).map(async (conv: any) => {
        // Get technician name
        let technician_name = 'فني';
        if (conv.technician_id) {
          const { data: tech } = await (supabase as any)
            .from('technicians')
            .select('name')
            .eq('id', conv.technician_id)
            .maybeSingle();
          if (tech) technician_name = tech.name;
        }

        // Get customer name from profiles
        let customer_name = 'عميل';
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', conv.customer_id)
          .maybeSingle();
        if (profile) customer_name = profile.name || 'عميل';

        // Get last message
        const { data: lastMsg } = await (supabase as any)
          .from('chat_messages')
          .select('message')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Get unread count
        const { count } = await (supabase as any)
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', user.id);

        return {
          ...conv,
          technician_name,
          customer_name,
          last_message: lastMsg?.message || '',
          unread_count: count || 0,
        };
      }));

      setConversations(enriched);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const { data, error } = await (supabase as any)
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [conversationId]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!conversationId || !currentUserId || !text.trim()) return false;

    try {
      // Determine sender type
      const { data: conv } = await (supabase as any)
        .from('chat_conversations')
        .select('customer_id, technician_id')
        .eq('id', conversationId)
        .maybeSingle();

      let senderType: 'customer' | 'technician' = 'customer';
      if (conv) {
        if (conv.customer_id === currentUserId) {
          senderType = 'customer';
        } else {
          senderType = 'technician';
        }
      }

      const { error } = await (supabase as any)
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          sender_type: senderType,
          message: text.trim(),
          message_type: 'text',
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      toast({ title: 'خطأ', description: 'فشل إرسال الرسالة', variant: 'destructive' });
      return false;
    }
  }, [conversationId, currentUserId, toast]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!conversationId || !currentUserId) return;
    await (supabase as any)
      .from('chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_id', currentUserId);
  }, [conversationId, currentUserId]);

  // Create conversation
  const createConversation = useCallback(async (technicianId: string, requestId?: string) => {
    if (!currentUserId) return null;
    try {
      // Check existing
      let query = (supabase as any)
        .from('chat_conversations')
        .select('id')
        .eq('customer_id', currentUserId)
        .eq('technician_id', technicianId)
        .eq('status', 'active');
      
      if (requestId) query = query.eq('request_id', requestId);

      const { data: existing } = await query.maybeSingle();
      if (existing) return existing.id;

      const { data, error } = await (supabase as any)
        .from('chat_conversations')
        .insert({
          customer_id: currentUserId,
          technician_id: technicianId,
          request_id: requestId || null,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      toast({ title: 'خطأ', description: 'فشل إنشاء المحادثة', variant: 'destructive' });
      return null;
    }
  }, [currentUserId, toast]);

  // Realtime subscriptions
  useEffect(() => {
    fetchConversations();

    const channel = supabase
      .channel('chat-conversations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchConversations]);

  useEffect(() => {
    if (!conversationId) return;
    fetchMessages();
    markAsRead();

    const channel = supabase
      .channel(`chat-messages-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
        markAsRead();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, fetchMessages, markAsRead]);

  return {
    conversations,
    messages,
    loading,
    currentUserId,
    sendMessage,
    createConversation,
    fetchConversations,
    fetchMessages,
  };
};
