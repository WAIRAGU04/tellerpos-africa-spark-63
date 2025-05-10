import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface RegistrationSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessData: {
    businessName: string;
    businessCategory: string;
    country: string;
  };
  userData: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const RegistrationSuccessDialog = ({
  open,
  onOpenChange,
  businessData,
  userData,
}: RegistrationSuccessDialogProps) => {
  const navigate = useNavigate();
  
  // Generate business ID and agent code - in real app, these would come from backend
  const businessId = `BUS-${Math.floor(100000 + Math.random() * 900000)}`;
  const agentCode = `AG-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const registrationDate = new Date().toISOString();

  // Store registration data in localStorage for settings page
  React.useEffect(() => {
    if (open) {
      // Save business data
      localStorage.setItem("businessId", businessId);
      localStorage.setItem("businessName", businessData.businessName);
      localStorage.setItem("businessCategory", businessData.businessCategory);
      localStorage.setItem("businessCountry", businessData.country);
      localStorage.setItem("registrationDate", registrationDate);
      
      // Save user data
      localStorage.setItem("firstName", userData.firstName);
      localStorage.setItem("lastName", userData.lastName);
      localStorage.setItem("email", userData.email);
      localStorage.setItem("userRole", "Admin"); // Default role for registrant
      localStorage.setItem("agentCode", agentCode);
    }
  }, [open, businessId, agentCode, businessData, userData, registrationDate]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(businessId);
    toast.success("Business ID copied to clipboard");
  };

  const handleContinue = () => {
    onOpenChange(false);
    navigate("/dashboard"); // Navigate to dashboard
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-tellerpos-dark-accent border-tellerpos/30">
        <ScrollArea>
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              Registration Successful!
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Your TellerPOS account has been successfully created.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">
                Your Business ID:
              </h4>
              <div className="flex items-center">
                <input
                  type="text"
                  value={businessId}
                  readOnly
                  className="bg-tellerpos-bg/50 border-tellerpos/20 text-white rounded-md px-3 py-2 w-full cursor-default"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 h-9"
                  onClick={handleCopyId}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                Keep this ID safe. You'll need it to sign in.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-white/80">
              <div className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-sm">Secure Account</span>
            </div>

            <div className="flex items-center space-x-2 text-white/80">
              <div className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-sm">Start Using Immediately</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full bg-tellerpos hover:bg-tellerpos/90 text-white font-bold py-3 text-base"
              onClick={handleContinue}
            >
              Continue to Dashboard
            </Button>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationSuccessDialog;
