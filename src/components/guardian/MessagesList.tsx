
import { useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Message } from './types';

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessagesList = ({ messages, isLoading }: MessagesListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-white via-slate-50/30 to-white relative" ref={scrollAreaRef}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-100/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-emerald-100/40 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      <div className="space-y-6 relative z-10 max-w-4xl mx-auto pb-4">
        {messages.map((message, index) => (
          <div 
            key={message.id} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <MessageBubble message={message} />
          </div>
        ))}
        
        {isLoading && (
          <div className="animate-fade-in">
            <TypingIndicator />
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default MessagesList;
