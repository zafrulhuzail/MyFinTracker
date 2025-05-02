import { useQuery, useMutation } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric', 
    minute: 'numeric',
    hour12: true 
  });
}

export default function NotificationsPage() {
  const { toast } = useToast();
  
  // Fetch notifications
  const { data: notifications, isLoading } = useQuery<Notification[]>({
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
  
  // Handle notification click to mark as read
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };
  
  // Mark all as read
  const markAllAsRead = () => {
    const unreadNotifications = notifications?.filter(n => !n.isRead) || [];
    
    // Only proceed if there are unread notifications
    if (unreadNotifications.length === 0) {
      toast({
        title: "No unread notifications",
        description: "All notifications have already been read",
      });
      return;
    }
    
    // Mark each unread notification as read
    Promise.all(
      unreadNotifications.map(notification => 
        apiRequest("PUT", `/api/notifications/${notification.id}/read`)
      )
    )
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Success",
        description: `Marked ${unreadNotifications.length} notifications as read`,
      });
    })
    .catch((error) => {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    });
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
  
  return (
    <div className="container max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm font-medium px-2.5 py-0.5 rounded-full ml-2">
              {unreadCount} unread
            </span>
          )}
        </div>
        
        <Button 
          variant="outline" 
          onClick={markAllAsRead}
          disabled={!notifications || notifications.filter(n => !n.isRead).length === 0}
        >
          Mark all as read
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No notifications found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md",
                !notification.isRead ? "border-l-4 border-l-primary bg-primary/5" : "border-l-4 border-l-gray-200"
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{notification.title}</h3>
                  <p className="text-gray-700 mt-1">{notification.message}</p>
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {formatDate(notification.createdAt.toString())}
                </div>
              </div>
              
              {!notification.isRead && (
                <div className="flex justify-end mt-2">
                  <span className="inline-block bg-primary/80 text-white text-xs px-2 py-0.5 rounded">
                    New
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}