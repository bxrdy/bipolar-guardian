
import { MobileDialog, MobileDialogContent, MobileDialogHeader, MobileDialogTitle, MobileDialogFooter } from "@/components/ui/mobile-dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  isDestructive?: boolean;
}

const ConfirmationDialog = ({
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Continue",
  isDestructive = false
}: ConfirmationDialogProps) => {
  const isMobile = useIsMobile();

  return (
    <MobileDialog open={isOpen} onOpenChange={onOpenChange}>
      <MobileDialogContent className="max-w-md">
        <MobileDialogHeader>
          <MobileDialogTitle>{title}</MobileDialogTitle>
        </MobileDialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600">
            {description}
          </p>
        </div>
        
        <MobileDialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className={cn(isMobile ? "w-full min-h-[48px]" : "flex-1")}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant={isDestructive ? "destructive" : "default"}
            className={cn(
              isDestructive && "bg-red-600 hover:bg-red-700",
              isMobile ? "w-full min-h-[48px]" : "flex-1"
            )}
          >
            {confirmText}
          </Button>
        </MobileDialogFooter>
      </MobileDialogContent>
    </MobileDialog>
  );
};

export default ConfirmationDialog;
