import React from 'react';
import { ContactCardProps } from './types';
import { ContactCardList } from './ContactCardList';
import { ContactCardGrid } from './ContactCardGrid';

interface EnhancedContactCardProps extends ContactCardProps {
  viewMode: 'grid' | 'list';
}

export const EnhancedContactCard: React.FC<EnhancedContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
  viewMode
}) => {
  if (viewMode === 'list') {
    return (
      <ContactCardList
        contact={contact}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

  return (
    <ContactCardGrid
      contact={contact}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};