
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  variant: 'card' | 'list' | 'chart' | 'header' | 'activity' | 'summary';
  count?: number;
  className?: string;
}

export const LoadingSkeleton = ({ variant, count = 1, className = "" }: LoadingSkeletonProps) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`bg-white rounded-xl p-6 space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        );
      
      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'chart':
        return (
          <div className={`bg-white rounded-xl p-6 space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="flex items-end space-x-2">
                  <Skeleton className={`w-8 h-${Math.floor(Math.random() * 20) + 10}`} />
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'header':
        return (
          <div className={`bg-white border-b border-gray-200 px-6 py-4 ${className}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-16 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>
        );
      
      case 'activity':
        return (
          <div className={`space-y-6 ${className}`}>
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }, (_, i) => (
                <LoadingSkeleton key={i} variant="card" />
              ))}
            </div>
            <LoadingSkeleton variant="chart" />
          </div>
        );
      
      case 'summary':
        return (
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="bg-white rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        );
      
      default:
        return <Skeleton className={`h-4 w-full ${className}`} />;
    }
  };

  return (
    <div className="animate-fade-in">
      {renderSkeleton()}
    </div>
  );
};
