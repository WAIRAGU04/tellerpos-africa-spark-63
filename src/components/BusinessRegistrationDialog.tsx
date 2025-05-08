
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Briefcase, List, Globe } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserRegistrationDialog from "./UserRegistrationDialog";

interface BusinessRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const businessCategories = [
  "Retail Store",
  "Wholesale",
  "Salon & Barbershop",
  "Spa & Beauty",
  "Car Wash",
  "Mini Mart",
  "Supermarket",
  "Hotel & Hospitality",
  "Restaurant & Cafe",
  "Kids & Toys Shop",
  "Gift Shop",
  "Electronics Store",
  "Clothing & Apparel",
  "Pharmacy & Healthcare",
  "Hardware Store",
  "Bookshop & Stationery",
  "Mobile Phone Shop",
  "Furniture Store",
  "Agricultural Supplies",
  "Butchery & Meat Shop",
  "Other"
];

const africanCountries = [
  "Kenya",
  "Nigeria",
  "South Africa",
  "Egypt",
  "Ghana",
  "Ethiopia",
  "Tanzania",
  "Rwanda",
  "Uganda",
  "Côte d'Ivoire",
  "Angola",
  "Botswana",
  "Cameroon",
  "Democratic Republic of Congo",
  "Malawi",
  "Mali",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Senegal",
  "Zambia",
  "Zimbabwe",
  "Other"
];

const BusinessRegistrationDialog = ({ open, onOpenChange }: BusinessRegistrationDialogProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    businessCategory: "",
    country: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.businessName.trim()) {
      toast.error("Please enter a business name");
      return;
    }
    if (!formData.businessCategory) {
      toast.error("Please select a business category");
      return;
    }
    if (!formData.country) {
      toast.error("Please select your country");
      return;
    }
    
    // Instead of completing the process here, open the user registration dialog
    setUserDialogOpen(true);
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
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">Let's Get Started</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Tell us about your business to customize your TellerPOS experience
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <label htmlFor="businessName" className="text-sm font-medium text-white">
                    What's your business name?
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Briefcase className="h-4 w-4 text-tellerpos/70" />
                    </div>
                    <Input
                      id="businessName"
                      placeholder="Enter business name"
                      value={formData.businessName}
                      onChange={(e) => handleChange("businessName", e.target.value)}
                      className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="businessCategory" className="text-sm font-medium text-white">
                    Business category
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                      <List className="h-4 w-4 text-tellerpos/70" />
                    </div>
                    <Select 
                      value={formData.businessCategory} 
                      onValueChange={(value) => handleChange("businessCategory", value)}
                    >
                      <SelectTrigger className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-tellerpos-dark-accent border-tellerpos/20 text-white max-h-[200px]">
                        {businessCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="country" className="text-sm font-medium text-white">
                    Country
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                      <Globe className="h-4 w-4 text-tellerpos/70" />
                    </div>
                    <Select 
                      value={formData.country} 
                      onValueChange={(value) => handleChange("country", value)}
                    >
                      <SelectTrigger className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent className="bg-tellerpos-dark-accent border-tellerpos/20 text-white max-h-[200px]">
                        {africanCountries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    Proceed to Try For Free
                  </Button>
                  
                  <div className="mt-4 flex items-center justify-center gap-6 text-white/80">
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center mr-2">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm">No credit card required</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center mr-2">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm">Free 14-day trial</span>
                    </div>
                  </div>
                </div>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <UserRegistrationDialog
        open={userDialogOpen}
        onOpenChange={(isOpen) => {
          setUserDialogOpen(isOpen);
          if (!isOpen) {
            onOpenChange(false); // Close parent dialog when user dialog is closed
            // Reset form data
            setFormData({
              businessName: "",
              businessCategory: "",
              country: ""
            });
          }
        }}
        businessData={formData}
      />
    </>
  );
};

export default BusinessRegistrationDialog;
