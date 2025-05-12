
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "./authUtils";

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
    // Redirect to the signup/login page
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }
  
  return <>{children}</>;
};

export const AuthenticatedRoute = ({ 
  children, 
  redirectTo = "/dashboard" 
}: ProtectedRouteProps) => {
  const location = useLocation();
  
  if (isAuthenticated()) {
    // Redirect to dashboard if already logged in
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};
