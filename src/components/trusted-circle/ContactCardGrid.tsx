import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock } from 'lucide-react';
import { ContactCardProps, priorityConfig } from './types';
import { getContactInitials, getRelationshipLabel } from './utils';
import { ContactCardActions } from './ContactCardActions';
import { ContactBadges } from './ContactBadges';
import { ContactInfo } from './ContactInfo';
import { ContactActionButtons } from './ContactActionButtons';
import { cn } from '@/lib/utils';

export const ContactCardGrid: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete
}) => {
  const priority = priorityConfig[contact.crisis_priority_level as keyof typeof priorityConfig];
  const initials = getContactInitials(contact.name);
  const relationshipLabel = getRelationshipLabel(contact.relationship);

  return (
    <Card className="p-4 hover:shadow-sm transition-all duration-200 group relative min-h-[240px] flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarFallback className={cn("text-white font-semibold text-sm", priority?.icon)}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base text-foreground mb-1 truncate">{contact.name}</h3>
            <p className="text-sm text-muted-foreground">{relationshipLabel}</p>
          </div>
        </div>

        <ContactCardActions
          contact={contact}
          onEdit={onEdit}
          onDelete={onDelete}
          className="flex-shrink-0"
        />
      </div>

      <div className="space-y-3 flex-1">
        <ContactBadges
          priorityLevel={contact.crisis_priority_level}
          verificationStatus={contact.verification_status}
          variant="compact"
        />

        <ContactInfo
          phone={contact.phone}
          email={contact.email}
          variant="compact"
        />
      </div>

      <ContactActionButtons
        phone={contact.phone}
        email={contact.email}
        variant="compact"
      />

      {contact.verification_status === 'pending' && (
        <div className="mt-2 text-xs text-amber-700 bg-amber-50/50 p-2 rounded text-center">
          <Clock className="h-3 w-3 inline mr-1" />
          Verification pending
        </div>
      )}
    </Card>
  );
};