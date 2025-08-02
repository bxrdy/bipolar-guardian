
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SupportMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

type Channel = ReturnType<typeof supabase.channel>;

export function useSupportChat(groupId: string) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<Channel | null>(null);

  // Fetch existing messages
  useEffect(() => {
    if (!groupId) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('support_messages')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }

        setMessages(data || []);
      } catch (error) {
        console.error('Error in fetchMessages:', error);
      }
    };

    fetchMessages();
  }, [groupId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`support_messages:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          const newMessage = payload.new as SupportMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [groupId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!groupId || !content.trim()) return;

    setIsSending(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // First, ensure user is a member of the group (auto-join for public groups)
      const { data: existingMember } = await (supabase as any)
        .from('support_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.user.id)
        .single();

      if (!existingMember) {
        // Auto-join the public group
        const { error: joinError } = await (supabase as any)
          .from('support_group_members')
          .insert({
            group_id: groupId,
            user_id: user.user.id
          });

        if (joinError && !joinError.message.includes('duplicate')) {
          console.error('Error joining group:', joinError);
          throw joinError;
        }
      }

      // Send the message
      const { error: messageError } = await (supabase as any)
        .from('support_messages')
        .insert({
          group_id: groupId,
          sender_id: user.user.id,
          content: content.trim()
        });

      if (messageError) {
        console.error('Error sending message:', messageError);
        throw messageError;
      }
    } catch (error: any) {
      console.error('Error in sendMessage:', error);
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [groupId]);

  return { messages, sendMessage, isSending };
}
