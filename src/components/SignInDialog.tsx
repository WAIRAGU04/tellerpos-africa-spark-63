
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle, Briefcase } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import ForgotPasswordDialog from "./ForgotPasswordDialog";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignInDialog = ({ open, onOpenChange }: SignInDialogProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessId: "",
    email: "",
    password: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
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
    
    if (!formData.password.trim()) {
      toast.error("Please enter your password");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call for login
    setTimeout(() => {
      toast.success("Signed in successfully!", {
        description: "Welcome back to TellerPOS!"
      });
      setIsSubmitting(false);
      onOpenChange(false);
      
      // Reset the form data
      setFormData({
        businessId: "",
        email: "",
        password: ""
      });

      // Navigate to dashboard after successful login
      navigate("/dashboard");
    }, 1500);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleForgotPassword = () => {
    // Open forgot password dialog and close sign-in dialog
    setForgotPasswordOpen(true);
    onOpenChange(false);
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px] bg-tellerpos-dark-accent border-tellerpos/30">
          <ScrollArea className="max-h-[80vh]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">Welcome Back</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Sign in to your TellerPOS account
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
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
                
                <div className="grid gap-2">
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
                
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-sm font-medium text-white">
                      Password
                    </label>
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      className="text-xs text-tellerpos hover:text-tellerpos/80 underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-tellerpos/70" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <div className="w-full">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-tellerpos hover:bg-tellerpos/90 text-white font-bold py-3 text-base"
                  >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                  
                  <div className="mt-4 flex items-center justify-center gap-2 text-white/80 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Secure login with encryption</span>
                  </div>
                </div>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
      />
    </>
  );
};

export default SignInDialog;
