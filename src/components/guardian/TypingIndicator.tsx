
import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex items-start space-x-3 justify-start animate-fade-in">
      <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-md border border-green-200/50 animate-pulse">
        <Bot className="w-4 h-4 text-green-600" />
      </div>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl px-4 py-3 shadow-md border border-gray-200/50">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce shadow-sm"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
