
import { useState } from "react";
import { Mail, ArrowRight, Briefcase } from "lucide-react";
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
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { requestPasswordReset } from "@/services/authService";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ForgotPasswordDialog = ({ open, onOpenChange }: ForgotPasswordDialogProps) => {
  const [formData, setFormData] = useState({
    businessId: "",
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  
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
      // Request password reset
      const result = await requestPasswordReset(formData.businessId, formData.email);
      
      if (result.success) {
        onOpenChange(false);
        setSuccessAlertOpen(true);
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

  const handleSuccessConfirm = () => {
    setSuccessAlertOpen(false);
    setFormData({
      businessId: "",
      email: ""
    });
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px] bg-tellerpos-dark-accent border-tellerpos/30">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Reset Password</DialogTitle>
              <DialogDescription className="text-gray-300">
                Enter your Business ID and email address, and we'll send you instructions to reset your password
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
            </div>
            
            <DialogFooter>
              <div className="w-full">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-tellerpos hover:bg-tellerpos/90 text-white font-bold py-3 text-base"
                >
                  {isSubmitting ? "Processing..." : "Send Reset Instructions"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={successAlertOpen} onOpenChange={setSuccessAlertOpen}>
        <AlertDialogContent className="bg-tellerpos-dark-accent border-tellerpos/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-xl">Check Your Email</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              We've sent password reset instructions to {formData.email}. Please check your inbox and follow the link to reset your password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={handleSuccessConfirm} 
              className="bg-tellerpos hover:bg-tellerpos/90 text-white"
            >
              Got it <ArrowRight className="ml-1 h-4 w-4" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ForgotPasswordDialog;
