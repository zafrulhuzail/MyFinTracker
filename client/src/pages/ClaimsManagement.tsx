import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Claim, User, updateClaimStatusSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import AppHeader from "@/components/layout/AppHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ClaimsManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const { toast } = useToast();

  // Fetch claims data
  const { data: claims, isLoading: isLoadingClaims } = useQuery<Claim[]>({
    queryKey: ["/api/claims"],
  });

  // Fetch users data for resolving student names
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Mutation for updating claim status
  const updateClaimMutation = useMutation({
    mutationFn: async (data: { id: number; status: string; comments: string }) => {
      return apiRequest("PUT", `/api/claims/${data.id}/status`, {
        status: data.status,
        description: data.comments, // Map comments to description field for the API
      });
    },
    onSuccess: () => {
      // Invalidate claims cache to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      
      // Close dialog and show success message
      setIsReviewOpen(false);
      toast({
        title: "Claim updated",
        description: "The claim status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update claim",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Review form
  const form = useForm({
    resolver: zodResolver(updateClaimStatusSchema),
    defaultValues: {
      status: "",
      comments: "",
    },
  });
  
  const onSubmitReview = (data: any) => {
    if (!selectedClaim) return;
    
    updateClaimMutation.mutate({
      id: selectedClaim.id,
      status: data.status,
      comments: data.comments,
    });
  };
  
  // Handle opening review dialog
  const handleReviewClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    form.reset({
      status: claim.status,
      comments: claim.description || "",
    });
    setIsReviewOpen(true);
  };
  
  // Filter claims based on active tab and search query
  const filteredClaims = claims?.filter((claim) => {
    // Filter by tab
    if (activeTab !== "all" && claim.status !== activeTab) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const studentName = users?.find(u => u.id === claim.userId)?.fullName.toLowerCase() || "";
      return (
        studentName.includes(query) ||
        claim.claimType.toLowerCase().includes(query) ||
        String(claim.amount).includes(query)
      );
    }
    
    return true;
  });
  
  // Get student name by userId
  const getStudentName = (userId: number) => {
    return users?.find(u => u.id === userId)?.fullName || "Unknown";
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="Claims Management" />
      
      <div className="flex-1">
        <div className="px-4 py-6 container mx-auto max-w-6xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Claims Management</h2>
            <p className="text-gray-600">Review and manage student allowance claims</p>
          </div>
          
          {/* Filters and Search */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-3">
                <Input
                  placeholder="Search by student name, claim type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
          
          {/* Claims Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                Student Claims
                {filteredClaims && (
                  <Badge variant="outline" className="ml-2">
                    {filteredClaims.length} {filteredClaims.length === 1 ? "claim" : "claims"}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingClaims ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : filteredClaims && filteredClaims.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClaims.map(claim => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">{claim.id}</TableCell>
                          <TableCell>{getStudentName(claim.userId)}</TableCell>
                          <TableCell>{claim.claimType}</TableCell>
                          <TableCell>${claim.amount.toFixed(2)}</TableCell>
                          <TableCell>{formatDate(claim.createdAt.toString())}</TableCell>
                          <TableCell>{getStatusBadge(claim.status)}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant={claim.status === "pending" ? "default" : "outline"}
                              onClick={() => handleReviewClaim(claim)}
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No claims found matching your filters.</p>
                  {searchQuery && (
                    <p className="mt-2">
                      Try adjusting your search or filter criteria.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Claim Review Dialog */}
          <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Review Claim</DialogTitle>
                <DialogDescription>
                  {selectedClaim && (
                    <div className="mt-2">
                      <p><strong>Student:</strong> {getStudentName(selectedClaim.userId)}</p>
                      <p><strong>Claim Type:</strong> {selectedClaim.claimType}</p>
                      <p><strong>Amount:</strong> ${selectedClaim.amount.toFixed(2)}</p>
                      <p><strong>Submitted:</strong> {formatDate(selectedClaim.createdAt.toString())}</p>
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comments</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any comments about this claim"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => setIsReviewOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateClaimMutation.isPending}
                    >
                      {updateClaimMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}