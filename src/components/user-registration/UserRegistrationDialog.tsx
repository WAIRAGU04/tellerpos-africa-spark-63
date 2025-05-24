
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import SignInDialog from "../SignInDialog";
import RegistrationSuccessDialog from "../RegistrationSuccessDialog";
import UserRegistrationForm from "./UserRegistrationForm";
import { countryCodes, UserFormData } from "./userRegistrationUtils";
import { registerUser } from "@/services/authService";
import { UserRegistrationFormData } from "@/schemas/authSchemas";
import { useErrorHandler } from "@/services/errorService";

interface UserRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessData: {
    businessName: string;
    businessCategory: string;
    country: string;
  };
}

const UserRegistrationDialog = ({ open, onOpenChange, businessData }: UserRegistrationDialogProps) => {
  const navigate = useNavigate();
  const { handleRetryableError } = useErrorHandler();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{businessId: string, userId: string} | undefined>(undefined);
  
  const handleSubmit = async (data: UserRegistrationFormData) => {
    setIsSubmitting(true);
    
    try {
      const result = await registerUser(data, businessData);
      
      if (result.success) {
        toast.success("Registration successful!", {
          description: `Welcome to TellerPOS, ${data.firstName}! Your account has been created.`
        });
        
        if ('businessId' in result && 'userId' in result) {
          setRegistrationResult({
            businessId: result.businessId,
            userId: result.userId
          });
        }
        setSuccessDialogOpen(true);
      } else {
        toast.error("Registration failed", {
          description: result.error || "There was an error creating your account. Please try again."
        });
      }
    } catch (error) {
      handleRetryableError(error, () => handleSubmit(data), 'User registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = () => {
    onOpenChange(false);
    setSignInDialogOpen(true);
  };

  const handleSuccessDialogClose = (open: boolean) => {
    setSuccessDialogOpen(open);
    if (!open) {
      onOpenChange(false);
    }
  };
  
  return (
    <>
      <Dialog open={open && !successDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen && !successDialogOpen) {
          onOpenChange(false);
        }
      }}>
        <DialogContent className="sm:max-w-[500px] bg-tellerpos-dark-accent border-tellerpos/30">
          <ScrollArea className="max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Tell Us About Yourself</DialogTitle>
              <DialogDescription className="text-gray-300">
                Complete your profile to start using TellerPOS for {businessData.businessName}
              </DialogDescription>
            </DialogHeader>
            
            <UserRegistrationForm
              onSubmit={handleSubmit}
              onSignInClick={handleSignIn}
              isSubmitting={isSubmitting}
              countryCode={countryCodes[businessData.country] || ""}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <RegistrationSuccessDialog
        open={successDialogOpen}
        onOpenChange={handleSuccessDialogClose}
        businessData={businessData}
        userData={{
          firstName: registrationResult?.userId ? "User" : "",
          lastName: "",
          email: ""
        }}
        registrationResult={registrationResult}
      />
      
      <SignInDialog
        open={signInDialogOpen}
        onOpenChange={setSignInDialogOpen}
      />
    </>
  );
};

export default UserRegistrationDialog;

