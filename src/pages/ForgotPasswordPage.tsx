
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { requestPasswordReset } from "@/services/authService";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessId: "",
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.businessId.trim()) {
      toast.error("Please enter your Business ID");
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    
    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await requestPasswordReset(formData.businessId, formData.email);
      
      if (result.success) {
        toast.success("Reset instructions sent!", {
          description: "Check your email for password reset instructions.",
        });
        
        // In development, show the reset link
        if (result.token) {
          console.log(`Reset link: /reset-password/${result.token}`);
          toast.info("Development: Check console for reset link");
        }
        
        navigate("/signup");
      } else {
        toast.error(result.message || "Password reset request failed");
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error("Password reset request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
              <CardTitle className="text-2xl text-white">Reset Password</CardTitle>
              <CardDescription className="text-gray-300">
                Enter your Business ID and email address to receive reset instructions
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="businessId" className="text-sm font-medium text-white">
                    Business ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Briefcase className="h-4 w-4 text-tellerpos/70" />
                    </div>
                    <Input
                      id="businessId"
                      placeholder="Enter your Business ID (e.g. TP-001)"
                      value={formData.businessId}
                      onChange={(e) => handleChange("businessId", e.target.value)}
                      className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-white">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-4 w-4 text-tellerpos/70" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-tellerpos hover:bg-tellerpos/90 text-white font-bold py-3"
                >
                  {isSubmitting ? "Processing..." : "Send Reset Instructions"}
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

export default ForgotPasswordPage;
