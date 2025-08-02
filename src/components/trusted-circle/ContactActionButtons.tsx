import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mail } from 'lucide-react';
import { handleCall, handleEmail } from './utils';

interface ContactActionButtonsProps {
  phone: string | null;
  email: string | null;
  variant?: 'compact' | 'default';
}

export const ContactActionButtons: React.FC<ContactActionButtonsProps> = ({
  phone,
  email,
  variant = 'default'
}) => {
  if (!phone && !email) return null;

  const isCompact = variant === 'compact';

  return (
    <div className={`flex items-center gap-2 ${isCompact ? 'mt-4' : 'mt-auto'}`}>
      {phone && (
        <Button
          variant="outline"
          size={isCompact ? "sm" : "default"}
          onClick={() => handleCall(phone)}
          className={`flex-1 ${isCompact ? 'h-8 text-xs' : 'h-10'}`}
        >
          <Phone className={`${isCompact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          Call
        </Button>
      )}
      
      {email && (
        <Button
          variant="outline"
          size={isCompact ? "sm" : "default"}
          onClick={() => handleEmail(email)}
          className={`flex-1 ${isCompact ? 'h-8 text-xs' : 'h-10'}`}
        >
          <Mail className={`${isCompact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          Email
        </Button>
      )}
    </div>
  );
};