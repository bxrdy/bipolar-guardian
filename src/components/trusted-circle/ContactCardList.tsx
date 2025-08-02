import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Mail } from 'lucide-react';
import { ContactCardProps, priorityConfig } from './types';
import { getContactInitials, getRelationshipLabel, handleCall, handleEmail } from './utils';
import { ContactCardActions } from './ContactCardActions';
import { ContactBadges } from './ContactBadges';
import { cn } from '@/lib/utils';

export const ContactCardList: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete
}) => {
  const priority = priorityConfig[contact.crisis_priority_level as keyof typeof priorityConfig];
  const initials = getContactInitials(contact.name);
  const relationshipLabel = getRelationshipLabel(contact.relationship);

  return (
    <Card className="p-4 hover:shadow-sm transition-all duration-200 border-l-4 border-l-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={cn("text-white font-semibold text-sm", priority?.icon)}>
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{contact.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{relationshipLabel}</p>
            
            <div className="mt-2">
              <ContactBadges
                priorityLevel={contact.crisis_priority_level}
                verificationStatus={contact.verification_status}
                variant="compact"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {contact.phone && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCall(contact.phone)}
              className="h-8 w-8 p-0"
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}
          
          {contact.email && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEmail(contact.email)}
              className="h-8 w-8 p-0"
            >
              <Mail className="h-4 w-4" />
            </Button>
          )}

          <ContactCardActions
            contact={contact}
            onEdit={onEdit}
            onDelete={onDelete}
            showMessageOption={true}
          />
        </div>
      </div>
    </Card>
  );
};