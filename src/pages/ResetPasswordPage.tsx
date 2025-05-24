
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { resetPasswordWithToken } from "@/services/authService";

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Validate token on component mount
    if (!token) {
      setTokenValid(false);
      return;
    }
    
    // Check if reset token exists in sessionStorage
    const resetData = sessionStorage.getItem(`reset_${token}`);
    if (!resetData) {
      setTokenValid(false);
      return;
    }
    
    try {
      const { expiry } = JSON.parse(resetData);
      if (Date.now() > expiry) {
        sessionStorage.removeItem(`reset_${token}`);
        setTokenValid(false);
        return;
      }
      
      setTokenValid(true);
    } catch {
      setTokenValid(false);
    }
  }, [token]);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Invalid reset token");
      return;
    }
    
    // Validation
    if (!formData.password.trim()) {
      toast.error("Please enter a new password");
      return;
    }
    
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await resetPasswordWithToken(token, formData.password);
      
      if (result.success) {
        toast.success("Password reset successfully!", {
          description: "You can now sign in with your new password.",
        });
        navigate("/signup");
      } else {
        toast.error(result.message || "Password reset failed");
        if (result.message?.includes("expired") || result.message?.includes("Invalid")) {
          setTokenValid(false);
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error("Password reset failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tellerpos-bg">
        <div className="text-white">Validating reset token...</div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex flex-col bg-tellerpos-bg">
        <div className="bg-tellerpos-dark-accent py-6 px-4">
          <div className="container mx-auto">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">TellerPOS</span>
            </Link>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md bg-tellerpos-dark-accent border-tellerpos/30">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Invalid Reset Link</CardTitle>
              <CardDescription className="text-gray-300">
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link 
                to="/forgot-password" 
                className="inline-flex items-center justify-center w-full bg-tellerpos hover:bg-tellerpos/90 text-white font-bold py-3 px-4 rounded"
              >
                Request New Reset Link
              </Link>
              <Link 
                to="/signup" 
                className="inline-flex items-center text-tellerpos hover:text-tellerpos/80 text-sm mt-4"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Sign In
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-tellerpos-bg">
      {/* Header */}
      <div className="bg-tellerpos-dark-accent py-6 px-4">
        <div className="container mx-auto">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-white">TellerPOS</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="bg-tellerpos-dark-accent border-tellerpos/30">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Reset Your Password</CardTitle>
              <CardDescription className="text-gray-300">
                Enter your new password below
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-white">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-tellerpos/70" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-tellerpos/70" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-tellerpos/70" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-tellerpos/70" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-tellerpos/70" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-tellerpos/70" />
                      )}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-tellerpos hover:bg-tellerpos/90 text-white font-bold py-3"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <Link 
                  to="/signup" 
                  className="inline-flex items-center text-tellerpos hover:text-tellerpos/80 text-sm"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
