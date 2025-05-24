
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  authenticateUser, 
  logoutUser, 
  isAuthenticated, 
  getAuthUser, 
  getBusinessData,
  tokenManager 
} from '@/services/authService';

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  agentCode: string;
  businessId: string;
  status: string;
  isTemporaryPassword?: boolean;
}

interface Business {
  businessId: string;
  businessName: string;
  email: string;
  phone: string;
  country: string;
  businessCategory: string;
  currency: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  business: Business | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (businessId: string, email: string, password: string) => Promise<{ success: boolean; message?: string; isTemporaryPassword?: boolean }>;
  logout: () => Promise<void>;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const refreshAuth = () => {
    try {
      const authUser = getAuthUser();
      const businessData = getBusinessData();
      const isAuth = isAuthenticated();

      setUser(authUser);
      setBusiness(businessData);
      setAuthenticated(isAuth);
    } catch (error) {
      console.error('Error refreshing auth:', error);
      setUser(null);
      setBusiness(null);
      setAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (businessId: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await authenticateUser(businessId, email, password);
      
      if (result.success) {
        refreshAuth();
        return { 
          success: true, 
          isTemporaryPassword: result.isTemporaryPassword 
        };
      } else {
        return { 
          success: false, 
          message: result.message 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: "Login failed. Please try again." 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await logoutUser();
      setUser(null);
      setBusiness(null);
      setAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const value = {
    user,
    business,
    isLoading,
    isAuthenticated: authenticated,
    login,
    logout,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
