import { cn } from "@/lib/utils";

type StatusType = "pending" | "approved" | "rejected" | "processing";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      bgColor: "bg-yellow-100",
      textColor: "text-warning",
      label: "Pending"
    },
    approved: {
      bgColor: "bg-green-100",
      textColor: "text-success",
      label: "Approved"
    },
    rejected: {
      bgColor: "bg-red-100",
      textColor: "text-error",
      label: "Rejected"
    },
    processing: {
      bgColor: "bg-blue-100",
      textColor: "text-info",
      label: "Processing"
    }
  };
  
  const config = statusConfig[status];
  
  return (
    <div className={cn(
      config.bgColor,
      config.textColor,
      "px-2 py-1 rounded-full text-xs font-medium inline-block",
      className
    )}>
      {config.label}
    </div>
  );
}
