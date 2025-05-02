import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import { useLocation, Link } from "wouter";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric',
    hour12: true 
  });
}

export default function Layout({ children, title = "Dashboard" }: LayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { mobileMenuOpen, setMobileMenuOpen } = useSidebar();
  const { toast } = useToast();
  
  // Don't render layout on login and register pages
  if (location === "/login" || location === "/register") {
    return <>{children}</>;
  }

  // Fetch notifications
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });
  
  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/notifications/${id}/read`);
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate the notifications query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  });
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const unreadNotifications = notifications?.filter(n => !n.isRead) || [];
  
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col pt-[64px] lg:pt-0">
        {/* Top Header - visible only on desktop */}
        <header className="bg-white border-b border-gray-200 h-16 shrink-0 flex items-center px-4 lg:px-6 z-20 hidden lg:flex">
          <h1 className="text-lg lg:text-xl font-semibold">{title}</h1>
          
          <div className="ml-auto flex items-center gap-2 lg:gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className={cn("h-5 w-5", unreadNotifications.length > 0 ? "text-primary" : "")} />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
                      {unreadNotifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-[320px] lg:w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <DropdownMenuLabel className="px-0 py-0">Notifications</DropdownMenuLabel>
                  {unreadNotifications.length > 0 && (
                    <span className="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                      {unreadNotifications.length} new
                    </span>
                  )}
                </div>
                <DropdownMenuSeparator />
                
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications && notifications.length > 0 ? (
                    notifications.slice(0, 8).map((notification) => (
                      <DropdownMenuItem 
                        key={notification.id} 
                        className="cursor-pointer p-0"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <Card className={cn(
                          "w-full p-3 border-l-4",
                          !notification.isRead ? "border-l-primary bg-primary/5" : "border-l-gray-200"
                        )}>
                          <div className="font-medium mb-1">{notification.title}</div>
                          <div className="text-sm text-gray-600 mb-1">{notification.message}</div>
                          <div className="text-xs text-gray-500">{formatDate(notification.createdAt.toString())}</div>
                        </Card>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
                  )}
                </div>
                
                <DropdownMenuSeparator />
                <a href="/notifications" className="block w-full px-2 py-1.5 text-center text-primary font-medium hover:bg-gray-100 rounded-sm">
                  View all notifications
                </a>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User menu could be added here */}
          </div>
        </header>
        
        {/* Mobile Header - contains menu toggle and notifications */}
        <div className="fixed top-0 left-0 right-0 h-[64px] flex items-center justify-between px-4 z-40 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="ml-3 text-lg font-semibold">{title}</h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className={cn("h-5 w-5", unreadNotifications.length > 0 ? "text-primary" : "")} />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
                    {unreadNotifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-[320px]">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="px-0 py-0">Notifications</DropdownMenuLabel>
                {unreadNotifications.length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                    {unreadNotifications.length} new
                  </span>
                )}
              </div>
              <DropdownMenuSeparator />
              
              <div className="max-h-[300px] overflow-y-auto">
                {notifications && notifications.length > 0 ? (
                  notifications.slice(0, 8).map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className="cursor-pointer p-0"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <Card className={cn(
                        "w-full p-3 border-l-4",
                        !notification.isRead ? "border-l-primary bg-primary/5" : "border-l-gray-200"
                      )}>
                        <div className="font-medium mb-1">{notification.title}</div>
                        <div className="text-sm text-gray-600 mb-1">{notification.message}</div>
                        <div className="text-xs text-gray-500">{formatDate(notification.createdAt.toString())}</div>
                      </Card>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
                )}
              </div>
              
              <DropdownMenuSeparator />
              <a href="/notifications" className="block w-full px-2 py-1.5 text-center text-primary font-medium hover:bg-gray-100 rounded-sm">
                View all notifications
              </a>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}