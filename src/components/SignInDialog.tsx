
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Mail, Key } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ForgotPasswordDialog from "./ForgotPasswordDialog";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignInDialog = ({ open, onOpenChange }: SignInDialogProps) => {
  const navigate = useNavigate();
  const [businessId, setBusinessId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!businessId.trim()) {
      toast.error("Please enter your Business ID");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call for authentication
    setTimeout(() => {
      // For demo purposes, authenticate if the business ID exists in localStorage
      // In a real application, this would call a proper authentication API
      const storedBusinessId = localStorage.getItem("businessId");
      
      if (storedBusinessId && (storedBusinessId === businessId || businessId === "BUS-123456")) {
        toast.success("Sign in successful");
        onOpenChange(false);
        // Navigate to dashboard after successful login
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials. Please check your Business ID, email, or password.");
      }
      
      setIsSubmitting(false);
    }, 1500);
  };
  
  const handleForgotPassword = () => {
    onOpenChange(false);
    setForgotPasswordOpen(true);
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] bg-tellerpos-dark-accent border-tellerpos/30">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Sign In to TellerPOS</DialogTitle>
            <DialogDescription className="text-gray-300">
              Enter your Business ID, email, and password to access your account.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <label htmlFor="businessId" className="text-sm font-medium text-white">
                  Business ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Key className="h-4 w-4 text-tellerpos/70" />
                  </div>
                  <Input
                    id="businessId"
                    placeholder="Enter your Business ID"
                    value={businessId}
                    onChange={(e) => setBusinessId(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium text-white">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Key className="h-4 w-4 text-tellerpos/70" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
                
                <div className="mt-4 flex items-center justify-center gap-6 text-white/80">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center mr-2">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm">Secure Sign In</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center mr-2">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm">Access Your Dashboard</span>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-tellerpos hover:text-tellerpos/80 text-sm underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            </DialogFooter>
          </form>
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
