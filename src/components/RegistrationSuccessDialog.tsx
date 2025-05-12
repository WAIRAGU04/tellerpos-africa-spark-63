
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Copy } from "lucide-react";

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
  userData 
}: RegistrationSuccessDialogProps) => {
  const navigate = useNavigate();
  
  // Generate IDs (in a real app these would come from your backend)
  const businessId = `TP${Math.floor(100000 + Math.random() * 900000)}`;
  const userId = `U${Math.floor(1000 + Math.random() * 9000)}`;
  
  const [copyStates, setCopyStates] = useState({
    businessId: false,
    userId: false
  });
  
  const copyToClipboard = (text: string, type: 'businessId' | 'userId') => {
    navigator.clipboard.writeText(text);
    
    setCopyStates(prev => ({ ...prev, [type]: true }));
    
    // Reset icon after 2 seconds
    setTimeout(() => {
      setCopyStates(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };
  
  const handleContinue = () => {
    onOpenChange(false);
    // Redirect to dashboard
    navigate("/dashboard");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-tellerpos-dark-accent border-tellerpos/30">
        <ScrollArea className="max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Registration Successful!</DialogTitle>
          </DialogHeader>
          
          <div className="my-6 space-y-6">
            <div className="space-y-4">
              <div className="bg-tellerpos/10 p-4 rounded-lg border border-tellerpos/20">
                <h3 className="text-lg text-white font-semibold mb-2">Account Created</h3>
                <p className="text-gray-300 mb-4">
                  Welcome to TellerPOS, {userData.firstName}! Your account has been created successfully.
                </p>
                
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Business Name</p>
                    <p className="text-white font-medium">{businessData.businessName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Your Role</p>
                    <p className="text-white font-medium">Administrator</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Email Address</p>
                    <p className="text-white font-medium">{userData.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-tellerpos/10 p-4 rounded-lg border border-tellerpos/20">
                <h3 className="text-lg text-white font-semibold mb-2">Important References</h3>
                <p className="text-gray-300 mb-4">
                  Please save these references for your records.
                </p>
                
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Business ID</p>
                    <div className="flex items-center justify-between bg-tellerpos-bg/40 p-2 rounded">
                      <p className="text-white font-medium">{businessId}</p>
                      <button 
                        onClick={() => copyToClipboard(businessId, 'businessId')}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        {copyStates.businessId ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">User ID</p>
                    <div className="flex items-center justify-between bg-tellerpos-bg/40 p-2 rounded">
                      <p className="text-white font-medium">{userId}</p>
                      <button 
                        onClick={() => copyToClipboard(userId, 'userId')}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        {copyStates.userId ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleContinue}
              className="w-full bg-tellerpos hover:bg-tellerpos/90 text-white"
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
