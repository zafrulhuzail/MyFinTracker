import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Claim, User } from "@shared/schema";
import AppHeader from "@/components/layout/AppHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import AdminClaimList from "@/components/admin/AdminClaimList";
import StatCard from "@/components/dashboard/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  ChartStyle
} from "@/components/ui/chart";
import * as RechartsPrimitive from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch all claims
  const { data: claims, isLoading: isLoadingClaims } = useQuery<Claim[]>({
    queryKey: ["/api/claims"],
  });
  
  // Stats calculation
  const pendingClaims = claims?.filter(claim => claim.status === "pending").length || 0;
  const approvedClaims = claims?.filter(claim => claim.status === "approved").length || 0;
  const rejectedClaims = claims?.filter(claim => claim.status === "rejected").length || 0;
  const totalClaims = claims?.length || 0;
  
  // Total amount statistics
  const totalPendingAmount = claims
    ?.filter(claim => claim.status === "pending")
    .reduce((total, claim) => total + claim.amount, 0) || 0;
    
  const totalApprovedAmount = claims
    ?.filter(claim => claim.status === "approved")
    .reduce((total, claim) => total + claim.amount, 0) || 0;
  
  // Group claims by type for chart
  const claimsByType: Record<string, { pending: number; approved: number; rejected: number }> = {};
  
  // Process claims to build claimsByType object
  claims?.forEach(claim => {
    // Ensure the claim type exists in our record
    if (!claimsByType[claim.claimType]) {
      claimsByType[claim.claimType] = {
        pending: 0,
        approved: 0,
        rejected: 0
      };
    }
    
    // Safely update the count for the specific status
    if (claim.status === "pending") {
      claimsByType[claim.claimType].pending += 1;
    } else if (claim.status === "approved") {
      claimsByType[claim.claimType].approved += 1;
    } else if (claim.status === "rejected") {
      claimsByType[claim.claimType].rejected += 1;
    }
  });
  
  // Transform claim types data for chart
  const chartData = Object.entries(claimsByType).map(([type, statuses]) => ({
    name: type,
    pending: statuses.pending,
    approved: statuses.approved,
    rejected: statuses.rejected
  }));
  
  // Get latest claims for the quick view
  const latestClaims = claims
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader title="Admin Dashboard" />
      
      <div className="flex-1 overflow-auto pb-16">
        <div className="px-4 py-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <p className="text-gray-600">Manage and review student claims</p>
          </div>
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="claims">Claims</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                {isLoadingClaims ? (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : (
                  <>
                    <StatCard 
                      title="Pending Claims" 
                      value={pendingClaims} 
                      color="text-warning"
                    />
                    <StatCard 
                      title="Approved Claims" 
                      value={approvedClaims} 
                      color="text-success"
                    />
                    <StatCard 
                      title="Total Claims" 
                      value={totalClaims} 
                      color="text-primary"
                    />
                    <StatCard 
                      title="Pending Amount" 
                      value={`€${totalPendingAmount.toFixed(2)}`} 
                      color="text-info"
                    />
                  </>
                )}
              </div>
              
              {/* Claims by Type Chart */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Claims by Type</h3>
                  
                  {isLoadingClaims ? (
                    <Skeleton className="h-64 w-full" />
                  ) : chartData.length > 0 ? (
                    <div className="h-64">
                      <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
                        <RechartsPrimitive.BarChart
                          data={chartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                          <RechartsPrimitive.XAxis dataKey="name" />
                          <RechartsPrimitive.YAxis />
                          <RechartsPrimitive.Tooltip />
                          <RechartsPrimitive.Legend />
                          <RechartsPrimitive.Bar dataKey="pending" stackId="a" fill="hsl(var(--warning))" />
                          <RechartsPrimitive.Bar dataKey="approved" stackId="a" fill="hsl(var(--success))" />
                          <RechartsPrimitive.Bar dataKey="rejected" stackId="a" fill="hsl(var(--error))" />
                        </RechartsPrimitive.BarChart>
                      </RechartsPrimitive.ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      No claim data available
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Recent Claims Table */}
              <div>
                <h3 className="text-lg font-medium mb-4">Recent Claims</h3>
                
                <Card>
                  {isLoadingClaims ? (
                    <div className="p-4">
                      <Skeleton className="h-64 w-full" />
                    </div>
                  ) : latestClaims && latestClaims.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {latestClaims.map((claim) => (
                          <TableRow key={claim.id}>
                            <TableCell>CL{claim.id.toString().padStart(4, '0')}</TableCell>
                            <TableCell>{claim.claimType}</TableCell>
                            <TableCell>€{claim.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                claim.status === "approved" ? "bg-green-100 text-success" :
                                claim.status === "rejected" ? "bg-red-100 text-error" :
                                "bg-yellow-100 text-warning"
                              }`}>
                                {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(claim.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No claims available
                    </div>
                  )}
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="claims" className="mt-4">
              <AdminClaimList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
