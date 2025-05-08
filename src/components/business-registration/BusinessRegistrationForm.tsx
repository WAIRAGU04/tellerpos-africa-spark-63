
import { Briefcase, List, Globe, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { businessCategories, africanCountries, BusinessFormData } from "./businessRegistrationUtils";

interface BusinessRegistrationFormProps {
  formData: BusinessFormData;
  handleChange: (field: string, value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSignIn: () => void;
}

const BusinessRegistrationForm = ({
  formData,
  handleChange,
  isSubmitting,
  onSubmit,
  onSignIn
}: BusinessRegistrationFormProps) => {
  return (
    <form onSubmit={onSubmit}>
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
        
        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={onSignIn}
            className="text-tellerpos hover:text-tellerpos/80 text-sm underline"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </form>
  );
};

export default BusinessRegistrationForm;
