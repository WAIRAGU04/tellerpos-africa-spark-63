
// Legacy auth utils - maintained for backward compatibility
// New code should use src/services/authService.ts and src/hooks/useAuth.tsx

import { 
  registerUser as serviceRegisterUser,
  authenticateUser as serviceAuthenticateUser,
  changeUserPassword as serviceChangeUserPassword,
  requestBusinessIdRecovery as serviceRequestBusinessIdRecovery,
  requestPasswordReset as serviceRequestPasswordReset,
  isAuthenticated as serviceIsAuthenticated,
  getAuthUser as serviceGetAuthUser,
  getBusinessData as serviceGetBusinessData,
  logoutUser as serviceLogoutUser
} from '@/services/authService';

import { BusinessFormData } from "@/components/business-registration/businessRegistrationUtils";
import { UserFormData } from "@/components/user-registration/userRegistrationUtils";

// Legacy wrapper functions for backward compatibility
export const saveUserRegistrationData = async (userData: UserFormData, businessData: BusinessFormData) => {
  return await serviceRegisterUser(userData, businessData);
};

export const authenticateUser = async (businessId: string, email: string, password: string) => {
  return await serviceAuthenticateUser(businessId, email, password);
};

export const changeUserPassword = async (email: string, oldPassword: string, newPassword: string) => {
  return await serviceChangeUserPassword(email, oldPassword, newPassword);
};

export const requestBusinessIdRecovery = async (email: string) => {
  return await serviceRequestBusinessIdRecovery(email);
};

export const requestPasswordReset = async (businessId: string, email: string) => {
  return await serviceRequestPasswordReset(businessId, email);
};

export const isAuthenticated = (): boolean => {
  return serviceIsAuthenticated();
};

export const getAuthUser = () => {
  return serviceGetAuthUser();
};

export const getBusinessData = () => {
  return serviceGetBusinessData();
};

export const logoutUser = async () => {
  return await serviceLogoutUser();
};
