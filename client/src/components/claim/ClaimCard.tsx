import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Claim } from "@shared/schema";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";

interface ClaimCardProps {
  claim: Claim;
}

export default function ClaimCard({ claim }: ClaimCardProps) {
  const {
    id,
    claimType,
    claimPeriod,
    amount,
    status,
    createdAt
  } = claim;
  
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{claimType}</h3>
            <p className="text-gray-500 text-sm">{claimPeriod}</p>
          </div>
          <StatusBadge status={status as any} />
        </div>
        <div className="flex justify-between mt-3">
          <div>
            <p className="text-gray-600 text-sm">Amount:</p>
            <p className="font-medium">€{amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Submitted:</p>
            <p className="text-sm">{formattedDate}</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <span className="material-icons text-gray-400 text-sm mr-1">receipt</span>
          <span className="text-gray-500 text-xs">ID: CL{id.toString().padStart(4, '0')}</span>
        </div>
        <Link to={`/claims/${id}`}>
          <button className="text-primary text-sm font-medium">Details</button>
        </Link>
      </div>
    </Card>
  );
}
