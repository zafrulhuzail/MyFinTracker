import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
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
  
  // Don't render layout on login and register pages
  if (location === "/login" || location === "/register") {
    return <>{children}</>;
  }

  // Fetch notifications
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const unreadNotifications = notifications?.filter(n => !n.isRead) || [];
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 shrink-0 flex items-center px-6 sticky top-0 z-20">
          <h1 className="text-xl font-semibold">{title}</h1>
          
          <div className="ml-auto flex items-center gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
                      {unreadNotifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications && notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem key={notification.id} className="cursor-pointer p-0">
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
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User menu could be added here */}
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}