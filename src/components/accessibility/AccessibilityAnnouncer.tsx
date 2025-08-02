
import React, { useEffect, useRef } from 'react';

interface AccessibilityAnnouncerProps {
  message?: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number;
}

const AccessibilityAnnouncer: React.FC<AccessibilityAnnouncerProps> = ({ 
  message, 
  priority = 'polite',
  clearAfter = 5000 
}) => {
  const ariaLiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && ariaLiveRef.current) {
      ariaLiveRef.current.textContent = message;
      
      if (clearAfter > 0) {
        const timeout = setTimeout(() => {
          if (ariaLiveRef.current) {
            ariaLiveRef.current.textContent = '';
          }
        }, clearAfter);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [message, clearAfter]);

  return (
    <div
      ref={ariaLiveRef}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    />
  );
};

export default AccessibilityAnnouncer;
