import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function BottomNavigation() {
  const [location] = useLocation();
  const { isAdmin } = useAuth();
  
  // Don't render navigation on login and register pages or for admin users
  if (location === "/login" || location === "/register" || isAdmin) {
    return null;
  }
  
  // Regular navigation for students
  return (
    <div className="bg-white border-t border-gray-200 py-2 px-4">
      <div className="flex justify-around">
        <Link to="/">
          <button className={`bottom-nav-item flex flex-col items-center ${location === "/" ? "active" : "text-gray-500"}`}>
            <span className="material-icons">home</span>
            <span className="text-xs mt-1">Home</span>
          </button>
        </Link>
        <Link to="/new-claim">
          <button className={`bottom-nav-item flex flex-col items-center ${location === "/new-claim" ? "active" : "text-gray-500"}`}>
            <span className="material-icons">add_circle</span>
            <span className="text-xs mt-1">New Claim</span>
          </button>
        </Link>
        <Link to="/history">
          <button className={`bottom-nav-item flex flex-col items-center ${location === "/history" ? "active" : "text-gray-500"}`}>
            <span className="material-icons">history</span>
            <span className="text-xs mt-1">History</span>
          </button>
        </Link>
        <Link to="/grades">
          <button className={`bottom-nav-item flex flex-col items-center ${location === "/grades" ? "active" : "text-gray-500"}`}>
            <span className="material-icons">school</span>
            <span className="text-xs mt-1">Grades</span>
          </button>
        </Link>
        <Link to="/profile">
          <button className={`bottom-nav-item flex flex-col items-center ${location === "/profile" ? "active" : "text-gray-500"}`}>
            <span className="material-icons">person</span>
            <span className="text-xs mt-1">Profile</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
