import { TrustedContact, relationshipEmojis } from './types';

export const getContactInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getRelationshipLabel = (relationship: string): string => {
  return relationshipEmojis[relationship?.toLowerCase()] || relationshipEmojis.other;
};

export const handleCall = (phone: string | null) => {
  if (phone) {
    window.open(`tel:${phone}`, '_self');
  }
};

export const handleEmail = (email: string | null) => {
  if (email) {
    window.open(`mailto:${email}`, '_self');
  }
};