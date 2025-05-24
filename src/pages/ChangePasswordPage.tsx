
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { changeUserPassword } from "@/services/authService";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const isFirstLogin = searchParams.get('firstLogin') === 'true';
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.currentPassword.trim()) {
      toast.error("Please enter your current password");
      return;
    }
    
    if (!formData.newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }
    
    if (formData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (formData.currentPassword === formData.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await changeUserPassword(email, formData.currentPassword, formData.newPassword);
      
      if (result.success) {
        toast.success("Password changed successfully!", {
          description: isFirstLogin ? "Welcome to TellerPOS!" : "Your password has been updated.",
        });
        
        if (isFirstLogin) {
          navigate("/dashboard");
        } else {
          navigate("/signup");
        }
      } else {
        toast.error(result.message || "Password change failed");
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error("Password change failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
              <CardTitle className="text-2xl text-white">
                {isFirstLogin ? "Set Your Password" : "Change Password"}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {isFirstLogin 
                  ? "Please set a new password for your account" 
                  : "Enter your current password and choose a new one"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="text-sm font-medium text-white">
                    {isFirstLogin ? "Temporary Password" : "Current Password"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-tellerpos/70" />
                    </div>
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      placeholder={isFirstLogin ? "Enter temporary password" : "Enter current password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleChange("currentPassword", e.target.value)}
                      className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPasswords.current ? (
                        <EyeOffIcon className="h-4 w-4 text-tellerpos/70" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-tellerpos/70" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-white">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-tellerpos/70" />
                    </div>
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={(e) => handleChange("newPassword", e.target.value)}
                      className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPasswords.new ? (
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
                      type={showPasswords.confirm ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPasswords.confirm ? (
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
                  {isSubmitting ? "Changing..." : "Change Password"}
                </Button>
              </form>
              
              {!isFirstLogin && (
                <div className="mt-4 text-center">
                  <Link 
                    to="/signup" 
                    className="inline-flex items-center text-tellerpos hover:text-tellerpos/80 text-sm"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Sign In
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
