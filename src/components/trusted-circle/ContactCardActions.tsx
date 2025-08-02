import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Trash2, MessageCircle, MoreVertical } from 'lucide-react';
import { ContactCardProps } from './types';

interface ContactCardActionsProps extends ContactCardProps {
  className?: string;
  showMessageOption?: boolean;
}

export const ContactCardActions: React.FC<ContactCardActionsProps> = ({
  contact,
  onEdit,
  onDelete,
  className = "",
  showMessageOption = false
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${className}`}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(contact)}>
          <Edit className="h-4 w-4 mr-2" />
          {showMessageOption ? 'Edit Contact' : 'Edit'}
        </DropdownMenuItem>
        {showMessageOption && (
          <DropdownMenuItem>
            <MessageCircle className="h-4 w-4 mr-2" />
            Send Message
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onDelete(contact.id)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {showMessageOption ? 'Remove Contact' : 'Remove'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};