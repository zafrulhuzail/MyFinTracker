import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Claim, Notification } from "@shared/schema";
import { PlusCircle, History, GraduationCap, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { user } = useAuth();
  
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
  const rejectedClaims = claims?.filter(claim => claim.status === "rejected").length || 0;
  
  // Get latest notifications
  const latestNotifications = notifications
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  // Format date
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  
  // Get notification badge variant
  const getNotificationVariant = (title: string): "default" | "destructive" | "outline" | "secondary" | null => {
    if (title.includes("Approved")) return "default";
    if (title.includes("Rejected")) return "destructive";
    if (title.includes("Pending") || title.includes("Submitted")) return "secondary";
    return "outline";
  };
  
  return (
    <>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.fullName.split(' ')[0] || "Student"}!
        </h1>
        <p className="text-gray-500">
          Here's an overview of your claims and academic progress
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {isLoadingClaims ? (
          <>
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Pending Claims</CardTitle>
                <CardDescription>Claims awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{pendingClaims}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Approved Claims</CardTitle>
                <CardDescription>Successfully processed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success-foreground">{approvedClaims}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Rejected Claims</CardTitle>
                <CardDescription>Requires attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-error">{rejectedClaims}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-1">
        {/* Latest Updates */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Latest Updates</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingNotifications ? (
                <div className="space-y-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              ) : latestNotifications && latestNotifications.length > 0 ? (
                <div className="space-y-4">
                  {latestNotifications.map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium">{notification.title}</div>
                        <Badge variant={getNotificationVariant(notification.title)}>
                          {notification.title.includes("Approved") ? "Approved" :
                           notification.title.includes("Rejected") ? "Rejected" :
                           notification.title.includes("Submitted") ? "Submitted" : "Info"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="text-xs text-gray-500">{formatDate(notification.createdAt.toString())}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No updates available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Upcoming Deadlines */}
      <div className="mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="bg-error/10 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-error" />
              </div>
              <div>
                <h4 className="font-medium">End of Semester Report</h4>
                <p className="text-gray-600 text-sm mt-1 mb-2">Submit your semester grades and progress report</p>
                <div className="text-error text-sm font-medium">Due in 5 days</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 justify-end">
            <Link to="/grades">
              <Button>Submit Report</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
