
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authenticateUser } from '@/services/authService';
import { useErrorHandler } from '@/services/errorService';
import { SignInFormData } from '@/schemas/authSchemas';

export const useSignIn = () => {
  const navigate = useNavigate();
  const { handleRetryableError } = useErrorHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signIn = async (data: SignInFormData) => {
    setIsSubmitting(true);
    
    try {
      const result = await authenticateUser(data.businessId, data.email, data.password);
      
      if (result.success) {
        if (result.isTemporaryPassword) {
          // Navigate to dedicated change password page instead of modal
          navigate(`/change-password?email=${encodeURIComponent(data.email)}&firstLogin=true`);
          return { success: true, isTemporaryPassword: true };
        }
        
        toast.success("Signed in successfully!", {
          description: "Welcome back to TellerPOS!",
        });
        
        navigate("/dashboard");
        return { success: true, isTemporaryPassword: false };
      } else {
        toast.error("Sign in failed", {
          description: result.message || "Please check your credentials and try again.",
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      handleRetryableError(error, () => signIn(data), 'Sign in');
      return { success: false, message: 'An error occurred during sign in' };
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToForgotPassword = () => {
    navigate("/forgot-password");
  };

  const navigateToBusinessRecovery = () => {
    navigate("/business-recovery");
  };

  return {
    signIn,
    isSubmitting,
    navigateToForgotPassword,
    navigateToBusinessRecovery,
  };
};
