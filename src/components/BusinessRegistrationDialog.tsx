
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
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
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Your free trial has been activated!", {
        description: `Welcome to TellerPOS, ${formData.businessName}!`
      });
      setIsSubmitting(false);
      onOpenChange(false);
      
      // In a real app, this would redirect to the dashboard or onboarding
      // navigate("/dashboard");
      
      // For demo purposes, we'll just close the dialog
      setFormData({
        businessName: "",
        businessCategory: "",
        country: ""
      });
    }, 1500);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-tellerpos-dark-accent border-tellerpos/30">
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
              <Input
                id="businessName"
                placeholder="Enter business name"
                value={formData.businessName}
                onChange={(e) => handleChange("businessName", e.target.value)}
                className="bg-tellerpos-bg/50 border-tellerpos/20 text-white"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="businessCategory" className="text-sm font-medium text-white">
                Business category
              </label>
              <Select 
                value={formData.businessCategory} 
                onValueChange={(value) => handleChange("businessCategory", value)}
              >
                <SelectTrigger className="bg-tellerpos-bg/50 border-tellerpos/20 text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-tellerpos-dark-accent border-tellerpos/20 text-white">
                  {businessCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="country" className="text-sm font-medium text-white">
                Country
              </label>
              <Select 
                value={formData.country} 
                onValueChange={(value) => handleChange("country", value)}
              >
                <SelectTrigger className="bg-tellerpos-bg/50 border-tellerpos/20 text-white">
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
          
          <DialogFooter>
            <div className="w-full">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-tellerpos hover:bg-tellerpos/90 text-white font-bold py-3 text-base"
              >
                {isSubmitting ? "Processing..." : "Proceed to Try For Free"}
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
      </DialogContent>
    </Dialog>
  );
};

export default BusinessRegistrationDialog;
