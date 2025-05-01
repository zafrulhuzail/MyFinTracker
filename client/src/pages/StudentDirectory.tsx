import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import AppHeader from "@/components/layout/AppHeader";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap,
  School 
} from "lucide-react";
import { 
  Avatar, 
  AvatarFallback 
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function StudentDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch all users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Filter users based on search query and active tab
  const filteredUsers = users?.filter(user => {
    // Skip admin users
    if (user.role === "admin") return false;
    
    // Filter by tab
    if (activeTab !== "all" && user.countryOfStudy !== activeTab) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.fullName.toLowerCase().includes(query) ||
        user.maraId.toLowerCase().includes(query) ||
        user.university.toLowerCase().includes(query) ||
        user.fieldOfStudy.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Get unique countries for tabs
  const countries = users
    ? Array.from(new Set(users.filter(u => u.role !== "admin").map(u => u.countryOfStudy)))
    : [];
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <div className="px-4 py-6 container mx-auto max-w-6xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Student Directory</h2>
            <p className="text-gray-600">Manage and monitor all sponsored students</p>
          </div>
          
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="grid grid-cols-1 gap-4">
              <Input
                placeholder="Search by name, MARA ID, university or field of study..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full overflow-x-auto flex-nowrap">
                  <TabsTrigger value="all">All Countries</TabsTrigger>
                  {countries.map(country => (
                    <TabsTrigger key={country} value={country}>
                      {country}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Students Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                Students
                {filteredUsers && (
                  <Badge variant="outline" className="ml-2">
                    {filteredUsers.length} found
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Academic Info</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {user.fullName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.fullName}</div>
                                <div className="text-xs text-gray-500">ID: {user.maraId}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="h-4 w-4 mr-1 text-gray-500" />
                                <span>{user.email}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Phone className="h-4 w-4 mr-1 text-gray-500" />
                                <span>{user.phoneNumber}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                                <span>{user.currentAddress}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <School className="h-4 w-4 mr-1 text-gray-500" />
                                <span>{user.university}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <GraduationCap className="h-4 w-4 mr-1 text-gray-500" />
                                <span>{user.degreeLevel} in {user.fieldOfStudy}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Group: {user.maraGroup} | Period: {user.sponsorshipPeriod}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">
                              Active
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No students found matching your filters.</p>
                  {searchQuery && (
                    <p className="mt-2">
                      Try adjusting your search or filter criteria.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}