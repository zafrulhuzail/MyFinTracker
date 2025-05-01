import { formatDistanceToNow } from "date-fns";

interface UpdateCardProps {
  title: string;
  message: string;
  type: "success" | "warning" | "info" | "error";
  timestamp: Date;
}

export default function UpdateCard({ title, message, type, timestamp }: UpdateCardProps) {
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bgColor: "bg-success",
          icon: "check_circle"
        };
      case "warning":
        return {
          bgColor: "bg-warning",
          icon: "hourglass_empty"
        };
      case "error":
        return {
          bgColor: "bg-error",
          icon: "cancel"
        };
      case "info":
      default:
        return {
          bgColor: "bg-info",
          icon: "info"
        };
    }
  };
  
  const styles = getTypeStyles();
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  
  return (
    <div className="p-4 border-b border-gray-100">
      <div className="flex items-start">
        <div className={`${styles.bgColor} rounded-full p-2 mr-3`}>
          <span className="material-icons text-white text-sm">{styles.icon}</span>
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-gray-600 text-sm">{message}</p>
          <p className="text-gray-400 text-xs mt-1">{timeAgo}</p>
        </div>
      </div>
    </div>
  );
}
