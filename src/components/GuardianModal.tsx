
import { MobileDialog, MobileDialogContent, MobileDialogBody } from "@/components/ui/mobile-dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import GuardianHeader from './guardian/GuardianHeader';
import MessagesList from './guardian/MessagesList';
import ChatInput from './guardian/ChatInput';
import { useGuardianChat } from './guardian/useGuardianChat';
import { GuardianModalProps } from './guardian/types';

const GuardianModal = ({ isOpen, onClose }: GuardianModalProps) => {
  const isMobile = useIsMobile();
  const { messages, isLoading, sendMessage } = useGuardianChat();

  return (
    <MobileDialog open={isOpen} onOpenChange={onClose}>
      <MobileDialogContent className={cn(
        "flex flex-col bg-white shadow-2xl border border-gray-200/50",
        isMobile 
          ? "h-[90vh] max-h-[90vh]" 
          : "w-[90vw] max-w-4xl h-[80vh] max-h-[80vh]"
      )}>
        <GuardianHeader isModal={true} />
        
        <MobileDialogBody className="flex-1 overflow-hidden p-0">
          <div className="flex flex-col h-full">
            <MessagesList messages={messages} isLoading={isLoading} />
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
          </div>
        </MobileDialogBody>
      </MobileDialogContent>
    </MobileDialog>
  );
};

export default GuardianModal;
