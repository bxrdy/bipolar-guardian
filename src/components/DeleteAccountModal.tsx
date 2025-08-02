
import { useState } from 'react';
import { MobileDialog, MobileDialogContent, MobileDialogHeader, MobileDialogTitle, MobileDialogFooter } from "@/components/ui/mobile-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isDeleting = false }: DeleteAccountModalProps) => {
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const isMobile = useIsMobile();

  const handleFirstStep = () => {
    setShowFinalConfirmation(true);
  };

  const handleCancel = () => {
    setShowFinalConfirmation(false);
    onClose();
  };

  const handleFinalConfirm = () => {
    onConfirm();
    setShowFinalConfirmation(false);
  };

  if (!showFinalConfirmation) {
    return (
      <MobileDialog open={isOpen} onOpenChange={onClose}>
        <MobileDialogContent className="max-w-md">
          <MobileDialogHeader className="space-y-4 p-6 pb-0">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 pr-8">
                <MobileDialogTitle className="text-xl font-semibold text-gray-900 text-left">
                  Delete Account
                </MobileDialogTitle>
              </div>
            </div>
          </MobileDialogHeader>
          
          <div className="px-6 py-6 space-y-6">
            <p className="text-base text-gray-700 leading-relaxed">
              This action will permanently delete your account and all associated data including:
            </p>
            
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>All mood entries and journal data</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Sleep, activity, and screen-time records</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Personal insights and analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Account settings and preferences</span>
                </li>
              </ul>
            </div>
          </div>

          <MobileDialogFooter className="border-t bg-gray-50/50 p-6 gap-3">
            <Button 
              onClick={handleCancel}
              variant="outline"
              className={cn(
                "font-medium border-gray-300 text-gray-700 hover:bg-gray-50",
                isMobile ? "w-full h-12" : "flex-1 h-11"
              )}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleFirstStep}
              variant="destructive"
              className={cn(
                "bg-red-600 hover:bg-red-700 font-medium",
                isMobile ? "w-full h-12" : "flex-1 h-11"
              )}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Continue
            </Button>
          </MobileDialogFooter>
        </MobileDialogContent>
      </MobileDialog>
    );
  }

  return (
    <MobileDialog open={isOpen} onOpenChange={onClose}>
      <MobileDialogContent className="max-w-md">
        <MobileDialogHeader className="space-y-4 p-6 pb-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1 pr-8">
              <MobileDialogTitle className="text-xl font-semibold text-red-900 text-left leading-tight">
                This erases ALL your data. Continue?
              </MobileDialogTitle>
            </div>
          </div>
        </MobileDialogHeader>

        <div className="px-6 py-6">
          <p className="text-base text-gray-700 leading-relaxed">
            This action cannot be undone. Your account and all data will be permanently removed from our servers.
          </p>
        </div>

        <MobileDialogFooter className="border-t bg-gray-50/50 p-6 gap-3">
          <Button 
            onClick={handleCancel}
            variant="outline"
            className={cn(
              "font-medium border-gray-300 text-gray-700 hover:bg-gray-50",
              isMobile ? "w-full h-12" : "flex-1 h-11"
            )}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleFinalConfirm}
            disabled={isDeleting}
            variant="destructive"
            className={cn(
              "bg-red-600 hover:bg-red-700 text-white font-medium",
              isMobile ? "w-full h-12" : "flex-1 h-11"
            )}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </MobileDialogFooter>
      </MobileDialogContent>
    </MobileDialog>
  );
};

export default DeleteAccountModal;
