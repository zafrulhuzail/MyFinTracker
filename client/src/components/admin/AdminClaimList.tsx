import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Claim, User } from "@shared/schema";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminClaimList() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Fetch claims
  const { data: claims, isLoading } = useQuery<Claim[]>({
    queryKey: ["/api/claims"],
  });
  
  // Apply filters to claims
  const filteredClaims = claims?.filter((claim) => {
    // Filter by status
    if (statusFilter !== "all" && claim.status !== statusFilter) {
      return false;
    }
    
    // Filter by search query (claim type or ID)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const idMatch = `cl${claim.id.toString().padStart(4, '0')}`.includes(searchLower);
      const typeMatch = claim.claimType.toLowerCase().includes(searchLower);
      
      return idMatch || typeMatch;
    }
    
    return true;
  });
  
  // Sort by newest first
  const sortedClaims = filteredClaims?.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const handleViewClaim = (claimId: number) => {
    setLocation(`/claims/${claimId}`);
  };
  
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Claims</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-2/3">
          <Input
            placeholder="Search by claim ID or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Claims Table */}
      <Card>
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-96 w-full" />
          </div>
        ) : sortedClaims && sortedClaims.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>CL{claim.id.toString().padStart(4, '0')}</TableCell>
                    <TableCell>{claim.claimType}</TableCell>
                    <TableCell>{claim.userId}</TableCell>
                    <TableCell>€{claim.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={claim.status as any} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleViewClaim(claim.id)}
                      >
                        {claim.status === "pending" ? "Review" : "View"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No claims match your filters</p>
          </div>
        )}
      </Card>
    </div>
  );
}
