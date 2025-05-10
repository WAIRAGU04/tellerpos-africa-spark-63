
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Mail, Phone, CalendarDays, MapPin } from "lucide-react";

interface BusinessData {
  businessId: string;
  businessName: string;
  businessCategory: string;
  phoneNumber: string;
  email: string;
  country: string;
  registrationDate: string;
}

interface BusinessSettingsProps {
  businessData: BusinessData;
}

const BusinessSettings = ({ businessData }: BusinessSettingsProps) => {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-tellerpos-dark-accent/10">
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
          <CardDescription>
            Information about your registered business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business ID */}
            <div className="space-y-2">
              <Label htmlFor="businessId" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>Business ID</span>
              </Label>
              <Input 
                id="businessId" 
                value={businessData.businessId} 
                readOnly
                className="bg-tellerpos-bg/20"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This is your unique business identifier
              </p>
            </div>
            
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>Business Name</span>
              </Label>
              <Input 
                id="businessName" 
                value={businessData.businessName} 
                readOnly
                className="bg-tellerpos-bg/20"
              />
            </div>
            
            {/* Business Category */}
            <div className="space-y-2">
              <Label htmlFor="businessCategory" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>Business Category</span>
              </Label>
              <Input 
                id="businessCategory" 
                value={businessData.businessCategory} 
                readOnly
                className="bg-tellerpos-bg/20"
              />
            </div>
            
            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Phone Number</span>
              </Label>
              <Input 
                id="phoneNumber" 
                value={businessData.phoneNumber} 
                readOnly
                className="bg-tellerpos-bg/20"
              />
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Email Address</span>
              </Label>
              <Input 
                id="email" 
                value={businessData.email} 
                readOnly
                className="bg-tellerpos-bg/20"
              />
            </div>
            
            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Country</span>
              </Label>
              <Input 
                id="country" 
                value={businessData.country} 
                readOnly
                className="bg-tellerpos-bg/20"
              />
            </div>
            
            {/* Registration Date */}
            <div className="space-y-2">
              <Label htmlFor="registrationDate" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>Registration Date</span>
              </Label>
              <Input 
                id="registrationDate" 
                value={formatDate(businessData.registrationDate)} 
                readOnly
                className="bg-tellerpos-bg/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessSettings;
