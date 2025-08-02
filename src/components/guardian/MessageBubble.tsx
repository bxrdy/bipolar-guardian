
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from './types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        "flex items-start space-x-3 group animate-fade-in",
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-md border border-green-200/50 transition-transform duration-200 group-hover:scale-105">
          <Bot className="w-4 h-4 text-green-600" />
        </div>
      )}
      
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md transition-all duration-200 group-hover:shadow-lg",
          message.role === 'user'
            ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border border-purple-400/20'
            : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 border border-gray-200/50'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={cn(
          "text-xs mt-2 font-medium transition-opacity duration-200 group-hover:opacity-100",
          message.role === 'user' 
            ? 'text-purple-100 opacity-70' 
            : 'text-gray-500 opacity-60'
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      
      {message.role === 'user' && (
        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-md border border-purple-200/50 transition-transform duration-200 group-hover:scale-105">
          <User className="w-4 h-4 text-purple-600" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
