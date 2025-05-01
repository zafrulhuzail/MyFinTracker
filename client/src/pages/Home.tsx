import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Claim, Notification } from "@shared/schema";
import AppHeader from "@/components/layout/AppHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import StatCard from "@/components/dashboard/StatCard";
import UpdateCard from "@/components/dashboard/UpdateCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch claims data
  const { data: claims, isLoading: isLoadingClaims } = useQuery<Claim[]>({
    queryKey: ["/api/claims"],
  });
  
  // Fetch notifications data
  const { data: notifications, isLoading: isLoadingNotifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });
  
  // Stats calculation
  const pendingClaims = claims?.filter(claim => claim.status === "pending").length || 0;
  const approvedClaims = claims?.filter(claim => claim.status === "approved").length || 0;
  
  // Get latest notifications
  const latestNotifications = notifications
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  // Map notification type
  const getNotificationType = (title: string): "success" | "warning" | "info" | "error" => {
    if (title.includes("Approved")) return "success";
    if (title.includes("Rejected")) return "error";
    if (title.includes("Pending") || title.includes("Review")) return "warning";
    return "info";
  };
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader />
      
      <div className="flex-1 overflow-auto pb-16">
        <div className="px-4 py-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Welcome back, {user?.fullName.split(' ')[0] || "Student"}!
            </h2>
            <p className="text-gray-600 mt-1">
              MARA Student ID: {user?.maraId || ""}
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {isLoadingClaims ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : (
              <>
                <StatCard
                  title="Pending Claims"
                  value={pendingClaims}
                  color="text-primary"
                />
                <StatCard
                  title="Approved Claims"
                  value={approvedClaims}
                  color="text-success"
                />
              </>
            )}
          </div>
          
          {/* Latest Updates */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Latest Updates</h3>
            <Card className="overflow-hidden">
              {isLoadingNotifications ? (
                <div className="p-4">
                  <Skeleton className="h-16 w-full mb-4" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : latestNotifications && latestNotifications.length > 0 ? (
                latestNotifications.map((notification) => (
                  <UpdateCard
                    key={notification.id}
                    title={notification.title}
                    message={notification.message}
                    type={getNotificationType(notification.title)}
                    timestamp={new Date(notification.createdAt)}
                  />
                ))
              ) : (
                <CardContent className="py-8 text-center text-gray-500">
                  No updates available
                </CardContent>
              )}
            </Card>
          </div>
          
          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/new-claim">
                <Button className="w-full h-20 bg-primary flex flex-col gap-1">
                  <span className="material-icons">add_circle</span>
                  <span>New Claim</span>
                </Button>
              </Link>
              <Link to="/history">
                <Button className="w-full h-20 bg-secondary flex flex-col gap-1">
                  <span className="material-icons">history</span>
                  <span>Claim History</span>
                </Button>
              </Link>
              <Link to="/grades">
                <Button className="w-full h-20 bg-accent text-black flex flex-col gap-1">
                  <span className="material-icons">school</span>
                  <span>Update Grades</span>
                </Button>
              </Link>
              <Link to="/profile">
                <Button className="w-full h-20 bg-gray-600 flex flex-col gap-1">
                  <span className="material-icons">person</span>
                  <span>Profile</span>
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Upcoming Deadlines */}
          <div>
            <h3 className="text-lg font-medium mb-3">Upcoming Deadlines</h3>
            <Card className="p-4">
              <div className="flex items-center mb-3">
                <span className="material-icons text-error mr-2">event</span>
                <p className="font-medium">End of Semester Report</p>
              </div>
              <p className="text-gray-600 mb-2">Submit your semester grades and progress report</p>
              <div className="flex justify-between items-center">
                <p className="text-error font-medium">Due in 5 days</p>
                <Link to="/grades">
                  <Button size="sm">Submit Now</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
