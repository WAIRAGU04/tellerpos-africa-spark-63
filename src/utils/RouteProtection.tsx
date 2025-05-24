
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  redirectTo = "/signup" 
}: ProtectedRouteProps) => {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }
  
  return <>{children}</>;
};

export const AuthenticatedRoute = ({ 
  children, 
  redirectTo = "/dashboard" 
}: ProtectedRouteProps) => {
  const location = useLocation();
  const state = location.state as { from?: string } | undefined;
  
  if (isAuthenticated()) {
    const redirectPath = state?.from || redirectTo;
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children}</>;
};
