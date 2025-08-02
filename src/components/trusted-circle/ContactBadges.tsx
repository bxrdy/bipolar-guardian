import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { priorityConfig, statusConfig } from './types';
import { cn } from '@/lib/utils';

interface ContactBadgesProps {
  priorityLevel: number | null;
  verificationStatus: string | null;
  variant?: 'compact' | 'default';
}

export const ContactBadges: React.FC<ContactBadgesProps> = ({
  priorityLevel,
  verificationStatus,
  variant = 'default'
}) => {
  const priority = priorityConfig[priorityLevel as keyof typeof priorityConfig];
  const status = statusConfig[verificationStatus as keyof typeof statusConfig];
  const StatusIcon = status?.icon;

  if (!priority || !status) return null;

  const isCompact = variant === 'compact';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge 
        variant="outline" 
        className={cn(
          isCompact ? "text-xs px-2 py-1" : "text-sm px-3 py-1 font-medium",
          "flex-shrink-0",
          priority.color
        )}
      >
        <Shield className={`${isCompact ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
        {priority.label}
      </Badge>
      <Badge 
        variant="outline" 
        className={cn(
          isCompact ? "text-xs px-2 py-1" : "text-sm px-3 py-1 font-medium",
          "flex-shrink-0",
          status.color
        )}
      >
        <StatusIcon className={`${isCompact ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
        {status.label}
      </Badge>
    </div>
  );
};