
import { Button } from "@/components/ui/button";
import { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple';
  onClick: () => void;
  loading: boolean;
}

const QuickActionButton = ({ 
  id, 
  title, 
  subtitle, 
  icon: IconComponent, 
  color, 
  onClick, 
  loading 
}: QuickActionButtonProps) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/30',
          icon: 'text-blue-600 dark:text-blue-400',
          hover: 'hover:bg-blue-50/60 dark:hover:bg-blue-900/40'
        };
      case 'green':
        return {
          bg: 'bg-green-50 dark:bg-green-900/30',
          icon: 'text-green-600 dark:text-green-400',
          hover: 'hover:bg-green-50/60 dark:hover:bg-green-900/40'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/30',
          icon: 'text-purple-600 dark:text-purple-400',
          hover: 'hover:bg-purple-50/60 dark:hover:bg-purple-900/40'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          icon: 'text-gray-600 dark:text-gray-400',
          hover: 'hover:bg-gray-50/60 dark:hover:bg-gray-700'
        };
    }
  };

  const colors = getColorClasses(color);

  return (
    <Button
      variant="ghost"
      className={`w-full h-auto p-0 flex items-center justify-start text-left ${colors.hover} transition-all duration-200 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 min-h-[44px]`}
      onClick={onClick}
      disabled={loading}
    >
      <div className="flex items-center space-x-3 p-6 w-full min-h-[44px]">
        <div className={`w-16 h-16 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <IconComponent className={`w-8 h-8 ${colors.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">
            {title}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {subtitle}
          </div>
        </div>
        {loading && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 flex-shrink-0" />
        )}
      </div>
    </Button>
  );
};

export default QuickActionButton;
