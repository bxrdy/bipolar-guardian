import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

export type TrustedContact = Tables<'trusted_contacts'>;

export interface ContactCardProps {
  contact: TrustedContact;
  onEdit: (contact: TrustedContact) => void;
  onDelete: (id: string) => void;
}

export const priorityConfig = {
  1: { 
    label: 'Emergency', 
    color: 'bg-red-50 text-red-700 border-red-200',
    gradient: 'from-red-50 to-red-100',
    icon: 'bg-red-100 text-red-600'
  },
  2: { 
    label: 'High Priority', 
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    gradient: 'from-orange-50 to-orange-100',
    icon: 'bg-orange-100 text-orange-600'
  },
  3: { 
    label: 'Support Network', 
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    gradient: 'from-blue-50 to-blue-100',
    icon: 'bg-blue-100 text-blue-600'
  }
};

export const statusConfig = {
  pending: { 
    icon: Clock, 
    label: 'Pending Verification', 
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    dot: 'bg-yellow-400'
  },
  verified: { 
    icon: CheckCircle, 
    label: 'Verified', 
    color: 'bg-green-50 text-green-700 border-green-200',
    dot: 'bg-green-400'
  },
  declined: { 
    icon: XCircle, 
    label: 'Declined', 
    color: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-400'
  }
};

export const relationshipEmojis: Record<string, string> = {
  family: 'Family',
  friend: 'Friend', 
  healthcare: 'Healthcare',
  therapist: 'Therapist',
  emergency: 'Emergency',
  other: 'Other'
};