import { useEffect, useRef, useState } from 'react';
import { useSupportChat } from '@/hooks/useSupportChat';
import ChatInput from '@/components/guardian/ChatInput';
import { supabase } from '@/integrations/supabase/client';

interface GroupChatProps {
  groupId: string;
  onBack: () => void;
}

const GroupChat = ({ groupId, onBack }: GroupChatProps) => {
  const { messages, sendMessage, isSending } = useSupportChat(groupId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b bg-white/80 backdrop-blur-sm flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-gray-500">← Back</button>
        <h2 className="font-medium text-gray-900">Community Chat</h2>
        <div className="w-6" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-xs md:max-w-md break-words px-4 py-2 rounded-lg shadow-sm ${m.sender_id === userId ? 'bg-emerald-600 text-white ml-auto' : 'bg-white text-gray-900'}`}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={sendMessage} isLoading={isSending} />
    </div>
  );
};

export default GroupChat;
