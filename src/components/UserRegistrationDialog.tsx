
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, User, Mail, Phone, Lock } from "lucide-react";
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
import SignInDialog from "./SignInDialog";

interface UserRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessData: {
    businessName: string;
    businessCategory: string;
    country: string;
  };
}

// Map of countries to their calling codes
const countryCodes: Record<string, string> = {
  "Kenya": "+254",
  "Nigeria": "+234",
  "South Africa": "+27",
  "Egypt": "+20",
  "Ghana": "+233",
  "Ethiopia": "+251",
  "Tanzania": "+255",
  "Rwanda": "+250",
  "Uganda": "+256",
  "Côte d'Ivoire": "+225",
  "Angola": "+244",
  "Botswana": "+267",
  "Cameroon": "+237",
  "Democratic Republic of Congo": "+243",
  "Malawi": "+265",
  "Mali": "+223",
  "Morocco": "+212",
  "Mozambique": "+258",
  "Namibia": "+264",
  "Senegal": "+221",
  "Zambia": "+260",
  "Zimbabwe": "+263",
  "Other": ""
};

const UserRegistrationDialog = ({ open, onOpenChange, businessData }: UserRegistrationDialogProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: countryCodes[businessData.country] || "",
    password: "",
    confirmPassword: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim()) {
      toast.error("Please enter your first name");
      return;
    }
    if (!formData.lastName.trim()) {
      toast.error("Please enter your last name");
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
    if (!formData.phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!formData.password.trim()) {
      toast.error("Please create a password");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call for registration
    setTimeout(() => {
      toast.success("Registration successful!", {
        description: `Welcome to TellerPOS, ${formData.firstName}! Your account has been created.`
      });
      setIsSubmitting(false);
      onOpenChange(false);
      
      // In a real app, this would redirect to the dashboard or onboarding
      // navigate("/dashboard");
      
      // For demo purposes, we'll just close the dialog
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: countryCodes[businessData.country] || "",
        password: "",
        confirmPassword: ""
      });
    }, 1500);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignIn = () => {
    // Close the user registration dialog and open sign in dialog
    onOpenChange(false);
    setSignInDialogOpen(true);
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] bg-tellerpos-dark-accent border-tellerpos/30">
          <ScrollArea className="max-h-[80vh]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">Tell Us About Yourself</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Complete your profile to start using TellerPOS for {businessData.businessName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-white">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-4 w-4 text-tellerpos/70" />
                    </div>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-white">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-4 w-4 text-tellerpos/70" />
                    </div>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
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
                  <label htmlFor="phoneNumber" className="text-sm font-medium text-white">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Phone className="h-4 w-4 text-tellerpos/70" />
                    </div>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChange={(e) => handleChange("phoneNumber", e.target.value)}
                      className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-400">Including country code (e.g. {countryCodes[businessData.country] || "+254"} 7XX XXX XXX)</p>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="password" className="text-sm font-medium text-white">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-tellerpos/70" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-400">Must be at least 6 characters</p>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-tellerpos/70" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
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
                    {isSubmitting ? "Processing..." : "Register"}
                  </Button>
                  
                  <div className="mt-4 flex items-center justify-center gap-6 text-white/80">
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center mr-2">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm">Secure Registration</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center mr-2">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm">Start Using Immediately</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <button 
                      type="button"
                      onClick={handleSignIn}
                      className="text-tellerpos hover:text-tellerpos/80 text-sm underline"
                    >
                      Already have an account? Sign in
                    </button>
                  </div>
                </div>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <SignInDialog
        open={signInDialogOpen}
        onOpenChange={setSignInDialogOpen}
      />
    </>
  );
};

export default UserRegistrationDialog;
