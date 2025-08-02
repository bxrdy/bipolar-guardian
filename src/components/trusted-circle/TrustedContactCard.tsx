
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Edit, Trash2, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type TrustedContact = Tables<'trusted_contacts'>;

interface TrustedContactCardProps {
  contact: TrustedContact;
  onEdit: (contact: TrustedContact) => void;
  onDelete: (id: string) => void;
}

const priorityLabels = {
  1: { label: 'Emergency', color: 'bg-red-100 text-red-800' },
  2: { label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
  3: { label: 'Support Network', color: 'bg-blue-100 text-blue-800' }
};

const verificationStatus = {
  pending: { icon: Clock, label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  verified: { icon: CheckCircle, label: 'Verified', color: 'bg-green-100 text-green-800' },
  declined: { icon: XCircle, label: 'Declined', color: 'bg-red-100 text-red-800' }
};

export const TrustedContactCard: React.FC<TrustedContactCardProps> = ({
  contact,
  onEdit,
  onDelete
}) => {
  const priority = priorityLabels[contact.crisis_priority_level as keyof typeof priorityLabels];
  const status = verificationStatus[contact.verification_status as keyof typeof verificationStatus];
  const StatusIcon = status.icon;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{contact.name}</h3>
          <p className="text-sm text-gray-600 capitalize">{contact.relationship}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(contact)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(contact.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={priority.color}>
          <Shield className="h-3 w-3 mr-1" />
          {priority.label}
        </Badge>
        <Badge className={status.color}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </div>

      <div className="space-y-2">
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{contact.phone}</span>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <span>{contact.email}</span>
          </div>
        )}
      </div>

      {contact.verification_status === 'pending' && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          Verification link sent. They need to confirm to receive notifications.
        </div>
      )}
    </Card>
  );
};
