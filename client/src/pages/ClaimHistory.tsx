import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Claim } from "@shared/schema";
import AppHeader from "@/components/layout/AppHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import ClaimCard from "@/components/claim/ClaimCard";
import { Skeleton } from "@/components/ui/skeleton";

type ClaimFilterType = "all" | "pending" | "approved" | "rejected";

export default function ClaimHistory() {
  const [activeFilter, setActiveFilter] = useState<ClaimFilterType>("all");
  
  // Fetch claims data
  const { data: claims, isLoading } = useQuery<Claim[]>({
    queryKey: ["/api/claims"],
  });
  
  // Filter claims based on active filter
  const filteredClaims = claims?.filter((claim) => {
    if (activeFilter === "all") return true;
    return claim.status === activeFilter;
  });
  
  // Sort claims by date (newest first)
  const sortedClaims = filteredClaims?.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader title="Claim History" />
      
      <div className="flex-1 overflow-auto pb-16">
        <div className="px-4 py-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Claim History</h2>
            <p className="text-gray-600">View and track all your submitted claims</p>
          </div>
          
          {/* Filter Options */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === "all"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter("pending")}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === "pending"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveFilter("approved")}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === "approved"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setActiveFilter("rejected")}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === "rejected"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
          
          {/* Claims List */}
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeletons
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full rounded-lg" />
                ))
            ) : sortedClaims && sortedClaims.length > 0 ? (
              // Render claims
              sortedClaims.map((claim) => (
                <ClaimCard key={claim.id} claim={claim} />
              ))
            ) : (
              // No claims message
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <span className="material-icons text-4xl text-gray-400 mb-2">
                  receipt_long
                </span>
                <h3 className="text-lg font-medium mb-1">No Claims Found</h3>
                <p className="text-gray-500">
                  {activeFilter === "all"
                    ? "You haven't submitted any claims yet."
                    : `You don't have any ${activeFilter} claims.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
