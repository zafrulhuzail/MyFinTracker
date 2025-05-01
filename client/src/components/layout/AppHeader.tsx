import { useAuth } from "@/contexts/AuthContext";

interface AppHeaderProps {
  title?: string;
}

export default function AppHeader({ title = "MARA Claim System" }: AppHeaderProps) {
  const { user } = useAuth();
  
  return (
    <div className="bg-primary text-white shadow-md z-10">
      {/* App header */}
      <div className="px-4 py-3 flex items-center">
        <h1 className="text-xl font-medium">{title}</h1>
        {user && (
          <div className="ml-auto">
            <span className="material-icons">notifications</span>
          </div>
        )}
      </div>
    </div>
  );
}
