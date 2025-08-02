
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (!inputMessage.trim() || isLoading) return;
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-gray-200/50 p-4 bg-gradient-to-r from-white via-gray-50 to-white relative overflow-hidden safe-bottom">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/30 to-transparent" />
      
      <div className="flex items-center space-x-3 relative z-10 max-w-4xl mx-auto">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Share what's on your mind..."
          disabled={isLoading}
          className="flex-1 border-gray-300/50 focus:border-green-400 focus:ring-green-400/30 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md focus:shadow-md placeholder:text-gray-400"
        />
        <Button
          onClick={handleSend}
          disabled={!inputMessage.trim() || isLoading}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-md"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
