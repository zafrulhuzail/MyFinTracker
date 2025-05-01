import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  PlusCircle, 
  History, 
  GraduationCap, 
  User, 
  LayoutDashboard,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

function NavItem({ to, label, icon, active }: NavItemProps) {
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 mb-1 font-normal",
          active ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:text-primary"
        )}
      >
        {icon}
        <span>{label}</span>
      </Button>
    </Link>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const { isAdmin, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't render sidebar on login and register pages
  if (location === "/login" || location === "/register") {
    return null;
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-30 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-primary">MARA Claim System</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Sidebar (Overlay) */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "bg-white border-r border-gray-200 w-64 shrink-0 fixed lg:static lg:translate-x-0 h-[calc(100vh-64px)] lg:h-screen z-50 transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo/Brand */}
        <div className="hidden lg:flex h-16 items-center border-b border-gray-200 px-6">
          <h1 className="text-xl font-semibold text-primary">MARA Claim System</h1>
        </div>
        
        {/* User info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full h-10 w-10 flex items-center justify-center text-primary font-semibold">
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{user?.fullName}</p>
              <p className="text-sm text-gray-500">{user?.maraId}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="p-3 overflow-y-auto">
          {isAdmin ? (
            // Admin Navigation
            <>
              <NavItem
                to="/admin"
                label="Dashboard"
                icon={<LayoutDashboard size={20} />}
                active={location === "/admin"}
              />
              <NavItem
                to="/history"
                label="Claims"
                icon={<History size={20} />}
                active={location === "/history"}
              />
              <NavItem
                to="/profile"
                label="Profile"
                icon={<User size={20} />}
                active={location === "/profile"}
              />
            </>
          ) : (
            // Student Navigation
            <>
              <NavItem
                to="/"
                label="Home"
                icon={<Home size={20} />}
                active={location === "/"}
              />
              <NavItem
                to="/new-claim"
                label="New Claim"
                icon={<PlusCircle size={20} />}
                active={location === "/new-claim"}
              />
              <NavItem
                to="/history"
                label="Claim History"
                icon={<History size={20} />}
                active={location === "/history"}
              />
              <NavItem
                to="/grades"
                label="Academic Records"
                icon={<GraduationCap size={20} />}
                active={location === "/grades"}
              />
              <NavItem
                to="/profile"
                label="Profile"
                icon={<User size={20} />}
                active={location === "/profile"}
              />
            </>
          )}
        </div>
        
        {/* Logout button */}
        <div className="p-3 border-t border-gray-200 mt-auto">
          <Button 
            variant="outline" 
            className="w-full justify-start text-gray-600"
            onClick={() => logout()}
          >
            Log Out
          </Button>
        </div>
      </div>
    </>
  );
}