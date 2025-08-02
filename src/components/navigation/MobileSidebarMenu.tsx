
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Home, Database, Heart, Settings, LogOut } from 'lucide-react';

interface MobileSidebarMenuProps {
  onClose: () => void;
  onShowSettings: () => void;
  onSignOut: () => void;
  onNavigateToDataStreams: () => void;
  onNavigateToHealthData: () => void;
  onNavigateToDashboard: () => void;
}

const MobileSidebarMenu = ({ 
  onClose, 
  onShowSettings, 
  onSignOut, 
  onNavigateToDataStreams, 
  onNavigateToHealthData,
  onNavigateToDashboard
}: MobileSidebarMenuProps) => {
  console.log('MobileSidebarMenu rendered with onSignOut:', typeof onSignOut);

  return (
    <div className="fixed inset-0 z-[60] bg-white safe-area-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 safe-area-top">
        <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
        <Button variant="ghost" onClick={onClose} className="p-2 h-auto">
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Menu Items - Scrollable content with bottom padding for safe area */}
      <div className="flex-1 overflow-y-auto pb-safe-bottom">
        <div className="space-y-1 px-4 py-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-left p-4 h-auto rounded-lg"
            onClick={onNavigateToDashboard}
          >
            <Home className="w-5 h-5 mr-3" />
            <span className="text-base">Dashboard</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-left p-4 h-auto rounded-lg"
            onClick={onNavigateToDataStreams}
          >
            <Database className="w-5 h-5 mr-3" />
            <span className="text-base">Data Streams</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-left p-4 h-auto rounded-lg"
            onClick={onNavigateToHealthData}
          >
            <Heart className="w-5 h-5 mr-3" />
            <span className="text-base">Health Data</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-left p-4 h-auto rounded-lg"
            onClick={onShowSettings}
          >
            <Settings className="w-5 h-5 mr-3" />
            <span className="text-base">Settings</span>
          </Button>

          {/* Separator before Sign Out - matching desktop pattern */}
          <div className="py-2">
            <Separator />
          </div>
          
          {/* Sign Out Button - matching desktop styling */}
          <Button
            variant="ghost"
            className="w-full justify-start text-left p-4 h-auto rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
              console.log('Sign Out button clicked');
              onSignOut();
            }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="text-base font-medium">Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebarMenu;
