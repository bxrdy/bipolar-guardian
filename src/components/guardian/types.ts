
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface GuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
}
