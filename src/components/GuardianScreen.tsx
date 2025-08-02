
import GuardianHeader from './guardian/GuardianHeader';
import MessagesList from './guardian/MessagesList';
import ChatInput from './guardian/ChatInput';
import { useGuardianChat } from './guardian/useGuardianChat';

interface GuardianScreenProps {
  onBack: () => void;
}

const GuardianScreen = ({ onBack }: GuardianScreenProps) => {
  const { messages, isLoading, sendMessage } = useGuardianChat();

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Guardian content - full screen without top bar */}
      <div className="flex-1 flex flex-col overflow-hidden pb-20">
        <GuardianHeader isModal={false} />
        <MessagesList messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default GuardianScreen;
