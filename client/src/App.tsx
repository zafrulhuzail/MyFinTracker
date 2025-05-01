import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "@/components/layout/Layout";

import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import NewClaim from "@/pages/NewClaim";
import ClaimHistory from "@/pages/ClaimHistory";
import Grades from "@/pages/Grades";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/AdminDashboard";
import ClaimDetails from "@/pages/ClaimDetails";

function ProtectedRoutes() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Check if user is logged in
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    setLocation("/login");
    return null;
  }
  
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/new-claim" component={NewClaim} />
        <Route path="/history" component={ClaimHistory} />
        <Route path="/grades" component={Grades} />
        <Route path="/profile" component={Profile} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/claims/:id" component={ClaimDetails} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function PublicRoutes() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
    </Switch>
  );
}

function AppRoutes() {
  const [location] = useLocation();
  const isAuthRoute = location === "/login" || location === "/register";
  
  if (isAuthRoute) {
    return <PublicRoutes />;
  }
  
  return <ProtectedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
