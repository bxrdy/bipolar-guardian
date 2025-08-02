
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Home,
  Pill,
  Heart,
  Settings,
  Shield,
  MessageSquare,
  Users,
  Database,
  Bug,
  LogOut,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppSidebarProps {
  currentScreen: string;
  onScreenChange: (screen: string) => void;
  userData?: {
    firstName?: string;
    email?: string;
  };
}

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType;
  badge?: string;
}

const mainItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: Home,
  },
  {
    title: "Health Data",
    url: "health",
    icon: Heart,
  },
];

const supportItems: MenuItem[] = [
  {
    title: "Guardian AI",
    url: "guardian",
    icon: Shield,
  },
  {
    title: "Talk to Peers",
    url: "support",
    icon: MessageSquare,
  },
  {
    title: "Trusted Circle",
    url: "trusted-circle",
    icon: Users,
  },
];

const systemItems: MenuItem[] = [
  {
    title: "Data Streams",
    url: "data-streams",
    icon: Database,
  },
  {
    title: "Settings",
    url: "settings",
    icon: Settings,
  },
  {
    title: "Testing",
    url: "testing",
    icon: Bug,
    badge: "Dev Mode",
  },
];

export function AppSidebar({ currentScreen, onScreenChange, userData }: AppSidebarProps) {
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out."
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign out.",
        variant: "destructive"
      });
    }
  };

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton 
          onClick={() => onScreenChange(item.url)}
          isActive={currentScreen === item.url}
          className="cursor-pointer"
        >
          <item.icon />
          <span>{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {item.badge}
            </Badge>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1">
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            Bipolar Guardian
          </h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderMenuItems(mainItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderMenuItems(supportItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderMenuItems(systemItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-2 border-t border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {userData?.firstName || 'User'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:bg-sidebar-accent hover:text-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
