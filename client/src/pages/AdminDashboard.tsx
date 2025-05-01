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
import { 
  BadgeInfo, 
  Mail, 
  Phone, 
  School, 
  BookOpen, 
  MapPin, 
  Flag, 
  GraduationCap, 
  Users 
} from "lucide-react";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all claims
  const { data: claims, isLoading: isLoadingClaims } = useQuery<Claim[]>({
    queryKey: ["/api/claims"],
  });
  
  // Fetch all users (students)
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Stats calculation
  const pendingClaims = claims?.filter(claim => claim.status === "pending").length || 0;
  const approvedClaims = claims?.filter(claim => claim.status === "approved").length || 0;
  const rejectedClaims = claims?.filter(claim => claim.status === "rejected").length || 0;
  const totalClaims = claims?.length || 0;
  
  // Student statistics
  const totalStudents = users?.filter(user => user.role !== "admin").length || 0;
  
  // Group students by country
  const studentsByCountry: Record<string, number> = {};
  users?.forEach(user => {
    if (user.role !== "admin") {
      const country = user.countryOfStudy;
      studentsByCountry[country] = (studentsByCountry[country] || 0) + 1;
    }
  });
  
  // Get top 3 countries
  const topCountries = Object.entries(studentsByCountry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  // Get total different universities
  const totalUniversities = new Set(
    users?.filter(user => user.role !== "admin").map(user => user.university)
  ).size;
  
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="claims">Claims</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {isLoadingClaims || isLoadingUsers ? (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
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
                      title="Total Students" 
                      value={totalStudents} 
                      color="text-blue-600"
                    />
                    <StatCard 
                      title="Universities" 
                      value={totalUniversities} 
                      color="text-purple-600"
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
              
              {/* Student Distribution Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Students by Country</h3>
                  <Card>
                    {isLoadingUsers ? (
                      <div className="p-4">
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : topCountries.length > 0 ? (
                      <div className="p-6">
                        {topCountries.map(([country, count], index) => (
                          <div key={country} className="mb-4">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{country}</span>
                              <span className="text-gray-600">{count} students</span>
                            </div>
                            <div className="h-2.5 bg-gray-200 rounded-full">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  index === 0 ? 'bg-primary' : 
                                  index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                                }`}
                                style={{ 
                                  width: `${(count / totalStudents) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                        
                        {totalStudents > 0 && topCountries.reduce((acc, [_, count]) => acc + count, 0) < totalStudents && (
                          <div className="mb-4">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Other Countries</span>
                              <span className="text-gray-600">
                                {totalStudents - topCountries.reduce((acc, [_, count]) => acc + count, 0)} students
                              </span>
                            </div>
                            <div className="h-2.5 bg-gray-200 rounded-full">
                              <div 
                                className="h-2.5 rounded-full bg-gray-400"
                                style={{ 
                                  width: `${((totalStudents - topCountries.reduce((acc, [_, count]) => acc + count, 0)) / totalStudents) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <Flag size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>No student data available</p>
                      </div>
                    )}
                  </Card>
                </div>
                
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
              </div>
            </TabsContent>
            
            <TabsContent value="students" className="mt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Student Directory</h3>
                  <div className="relative w-64">
                    <Input
                      type="text"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <Users size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                
                {isLoadingUsers ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full" />
                    ))}
                  </div>
                ) : users?.filter(user => 
                  user.role !== "admin" && 
                  (searchQuery === "" || 
                    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.maraId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.university.toLowerCase().includes(searchQuery.toLowerCase()))
                ).length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users
                      .filter(user => 
                        user.role !== "admin" && 
                        (searchQuery === "" || 
                          user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.maraId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.university.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map(student => (
                        <Card key={student.id} className="overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-500 to-primary h-12"></div>
                          <div className="p-4 pt-0 -mt-6">
                            <div className="flex gap-4">
                              <Avatar className="h-16 w-16 border-4 border-white">
                                <AvatarFallback className="text-xl bg-primary text-white">
                                  {student.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 mt-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-bold text-lg">{student.fullName}</h4>
                                    <p className="text-sm text-gray-600">MARA ID: {student.maraId}</p>
                                  </div>
                                  <Badge variant="outline" className="text-xs border-primary text-primary">
                                    {student.degreeLevel}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3 mt-4">
                              <div className="flex items-center gap-2 text-sm">
                                <School size={16} className="text-gray-400" />
                                <span className="font-medium">{student.university}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <BookOpen size={16} className="text-gray-400" />
                                <span>{student.fieldOfStudy}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Mail size={16} className="text-gray-400" />
                                <span>{student.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Flag size={16} className="text-gray-400" />
                                <span>{student.countryOfStudy}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <BadgeInfo size={16} className="text-gray-400" />
                                <span>MARA Group: {student.maraGroup}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 border rounded-md bg-gray-50">
                    <Users size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-1">No Students Found</h3>
                    <p>
                      {searchQuery 
                        ? `No students matching "${searchQuery}"`
                        : "There are no students registered in the system yet."}
                    </p>
                  </div>
                )}
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
