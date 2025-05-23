
import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
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
import { requestBusinessIdRecovery } from "@/utils/authUtils";

interface BusinessIdRecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BusinessIdRecoveryDialog = ({ open, onOpenChange }: BusinessIdRecoveryDialogProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    // Request business ID recovery
    const result = requestBusinessIdRecovery(email);
    
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Always show success for security reasons, even if email not found
      onOpenChange(false);
      setSuccessAlertOpen(true);
    }, 1500);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSuccessConfirm = () => {
    setSuccessAlertOpen(false);
    setEmail("");
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px] bg-tellerpos-dark-accent border-tellerpos/30">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Recover Business ID</DialogTitle>
              <DialogDescription className="text-gray-300">
                Enter your registered email address, and we'll send you your Business ID
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-6">
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
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  {isSubmitting ? "Processing..." : "Recover Business ID"}
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
              If this email is registered in our system, we've sent your Business ID recovery information to {email}. Please check your inbox.
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

export default BusinessIdRecoveryDialog;
