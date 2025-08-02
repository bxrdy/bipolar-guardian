import React from 'react';
import { Phone, Mail } from 'lucide-react';

interface ContactInfoProps {
  phone: string | null;
  email: string | null;
  variant?: 'compact' | 'default';
}

export const ContactInfo: React.FC<ContactInfoProps> = ({
  phone,
  email,
  variant = 'default'
}) => {
  if (!phone && !email) return null;

  const isCompact = variant === 'compact';

  return (
    <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
      {phone && (
        <div className={`flex items-center gap-2 ${isCompact ? 'text-sm' : 'text-sm'}`}>
          <Phone className={`${isCompact ? 'h-3 w-3' : 'h-4 w-4'} text-muted-foreground flex-shrink-0`} />
          <span className={`truncate ${isCompact ? 'text-xs font-mono' : 'font-mono'}`}>
            {phone}
          </span>
        </div>
      )}
      {email && (
        <div className={`flex items-center gap-2 ${isCompact ? 'text-sm' : 'text-sm'}`}>
          <Mail className={`${isCompact ? 'h-3 w-3' : 'h-4 w-4'} text-muted-foreground flex-shrink-0`} />
          <span className={`truncate ${isCompact ? 'text-xs' : ''}`}>
            {email}
          </span>
        </div>
      )}
    </div>
  );
};