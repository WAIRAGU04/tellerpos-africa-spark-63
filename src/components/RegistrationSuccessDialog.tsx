import { useState, useEffect } from "react";
import { CheckCircle, Copy, ArrowRight } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

// Function to generate business ID (TP-XXX format)
const generateBusinessId = () => {
  // In a real app, this would come from a database with the latest ID
  // For now, we'll simulate with a random 3-digit number
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `TP-${randomNum}`;
};

// Function to generate agent code (6 character alphanumeric)
const generateAgentCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const RegistrationSuccessDialog = ({ 
  open, 
  onOpenChange, 
  businessData, 
  userData 
}: RegistrationSuccessDialogProps) => {
  const [businessId, setBusinessId] = useState("");
  const [agentCode, setAgentCode] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    if (open) {
      // Generate IDs when dialog opens
      setBusinessId(generateBusinessId());
      setAgentCode(generateAgentCode());
    }
  }, [open]);
  
  const handleCopyBusinessId = () => {
    navigator.clipboard.writeText(businessId);
    toast.success("Business ID copied to clipboard");
  };
  
  const handleCopyAgentCode = () => {
    navigator.clipboard.writeText(agentCode);
    toast.success("Agent code copied to clipboard");
  };
  
  const handleClose = () => {
    onOpenChange(false);
    // Redirect to dashboard
    navigate("/dashboard");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-tellerpos-dark-accent border-tellerpos/30">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-tellerpos/20 mb-4">
            <CheckCircle className="h-8 w-8 text-tellerpos" />
          </div>
          <DialogTitle className="text-2xl text-center text-white">Registration Successful!</DialogTitle>
          <DialogDescription className="text-center text-gray-300">
            Welcome {userData.firstName} {userData.lastName} to TellerPOS. Your business account for {businessData.businessName} has been created.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          <div className="bg-tellerpos-bg rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-400">Your Business ID</p>
              <button 
                onClick={handleCopyBusinessId} 
                className="text-tellerpos hover:text-tellerpos/80"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xl font-bold text-white tracking-wider">{businessId}</p>
            <p className="text-xs text-gray-400 mt-1">Required for login to your business account</p>
          </div>
          
          <div className="bg-tellerpos-bg rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-400">Your Agent Code</p>
              <button 
                onClick={handleCopyAgentCode} 
                className="text-tellerpos hover:text-tellerpos/80"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xl font-bold text-white tracking-wider">{agentCode}</p>
            <p className="text-xs text-gray-400 mt-1">Your unique identification code as the business admin</p>
          </div>
          
          <div className="bg-tellerpos/10 border border-tellerpos/20 rounded-lg p-4">
            <p className="text-sm text-white">Important Information:</p>
            <ul className="text-sm text-gray-300 mt-2 space-y-2">
              <li className="flex items-start">
                <span className="text-tellerpos mr-2">•</span>
                <span>Keep your Business ID and Agent Code secure.</span>
              </li>
              <li className="flex items-start">
                <span className="text-tellerpos mr-2">•</span>
                <span>The Business ID will be shared with all users you create for your business.</span>
              </li>
              <li className="flex items-start">
                <span className="text-tellerpos mr-2">•</span>
                <span>Each user will have a unique Agent Code.</span>
              </li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleClose}
            className="w-full bg-tellerpos hover:bg-tellerpos/90 text-white font-bold py-3 text-base"
          >
            Continue to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationSuccessDialog;
