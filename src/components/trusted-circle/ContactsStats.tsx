import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  CheckCircle, 
  Clock,
  Shield
} from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type TrustedContact = Tables<'trusted_contacts'>;

interface ContactsStatsProps {
  contacts: TrustedContact[];
}

export const ContactsStats: React.FC<ContactsStatsProps> = ({ contacts }) => {
  const stats = {
    total: contacts.length,
    verified: contacts.filter(c => c.verification_status === 'verified').length,
    pending: contacts.filter(c => c.verification_status === 'pending').length,
    emergency: contacts.filter(c => c.crisis_priority_level === 1).length,
  };

  if (stats.total === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-semibold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Contacts</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-semibold text-foreground">{stats.verified}</p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50">
            <Shield className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-xl font-semibold text-foreground">{stats.emergency}</p>
            <p className="text-xs text-muted-foreground">Emergency</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
          </div>
          <div>
            <p className="text-xl font-semibold text-foreground">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
      </Card>
    </div>
  );
};