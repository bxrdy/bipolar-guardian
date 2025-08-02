
import { ReactNode } from 'react';

interface FadeTransitionProps {
  children: ReactNode;
  isVisible: boolean;
  className?: string;
  duration?: 'fast' | 'normal' | 'slow';
}

export const FadeTransition = ({ 
  children, 
  isVisible, 
  className = "",
  duration = 'normal'
}: FadeTransitionProps) => {
  const durationClass = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500'
  }[duration];

  return (
    <div 
      className={`transition-all ${durationClass} ${
        isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-2'
      } ${className}`}
    >
      {children}
    </div>
  );
};
