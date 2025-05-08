
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
import UserRegistrationDialog from "../user-registration/UserRegistrationDialog";
import SignInDialog from "../SignInDialog";
import BusinessRegistrationForm from "./BusinessRegistrationForm";
import { validateBusinessForm, BusinessFormData } from "./businessRegistrationUtils";

interface BusinessRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BusinessRegistrationDialog = ({ open, onOpenChange }: BusinessRegistrationDialogProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: "",
    businessCategory: "",
    country: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const validation = validateBusinessForm(formData);
    if (!validation.isValid) {
      toast.error(validation.errorMessage);
      return;
    }
    
    // Now we don't automatically open the user dialog
    // Instead, we'll pass the validated data to the next step
    setUserDialogOpen(true);
  };

  const handleSignIn = () => {
    // Close the business registration dialog and open sign in dialog
    onOpenChange(false);
    setSignInDialogOpen(true);
  };
  
  return (
    <>
      <Dialog open={open && !userDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen && !userDialogOpen) {
          // Only allow closing if the user dialog is not open
          onOpenChange(false);
        }
      }}>
        <DialogContent className="sm:max-w-[500px] bg-tellerpos-dark-accent border-tellerpos/30">
          <ScrollArea className="max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Let's Get Started</DialogTitle>
              <DialogDescription className="text-gray-300">
                Tell us about your business to customize your TellerPOS experience
              </DialogDescription>
            </DialogHeader>
            
            <BusinessRegistrationForm
              formData={formData}
              handleChange={handleChange}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onSignIn={handleSignIn}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <UserRegistrationDialog
        open={userDialogOpen}
        onOpenChange={(isOpen) => {
          setUserDialogOpen(isOpen);
          if (!isOpen) {
            // Reset form data if user dialog is closed
            setFormData({
              businessName: "",
              businessCategory: "",
              country: ""
            });
            onOpenChange(false); // Close parent dialog when user dialog is closed
          }
        }}
        businessData={formData}
      />
      
      <SignInDialog
        open={signInDialogOpen}
        onOpenChange={setSignInDialogOpen}
      />
    </>
  );
};

export default BusinessRegistrationDialog;
