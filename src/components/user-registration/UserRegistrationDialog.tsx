
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
import { validateUserRegistration, countryCodes, UserFormData } from "./userRegistrationUtils";
import { saveUserRegistrationData } from "@/utils/authUtils";

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
  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: countryCodes[businessData.country] || "",
    password: "",
    confirmPassword: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{businessId: string, userId: string} | undefined>(undefined);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const validation = validateUserRegistration(formData);
    if (!validation.isValid) {
      toast.error(validation.errorMessage);
      return;
    }
    
    setIsSubmitting(true);
    
    // Save registration data using the utility function
    const result = saveUserRegistrationData(formData, businessData);
    
    if (result.success) {
      toast.success("Registration successful!", {
        description: `Welcome to TellerPOS, ${formData.firstName}! Your account has been created.`
      });
      // Save the generated IDs to pass to the success dialog
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
    
    setIsSubmitting(false);
  };

  const handleSignIn = () => {
    // Close the user registration dialog and open sign in dialog
    onOpenChange(false);
    setSignInDialogOpen(true);
  };

  const handleSuccessDialogClose = (open: boolean) => {
    setSuccessDialogOpen(open);
    if (!open) {
      // Reset and close registration form when success dialog is closed
      onOpenChange(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: countryCodes[businessData.country] || "",
        password: "",
        confirmPassword: ""
      });
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
              formData={formData}
              handleChange={handleChange}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onSignInClick={handleSignIn}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <RegistrationSuccessDialog
        open={successDialogOpen}
        onOpenChange={handleSuccessDialogClose}
        businessData={businessData}
        userData={{
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
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
