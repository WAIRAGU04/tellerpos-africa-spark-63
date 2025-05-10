
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import BusinessSettings from "./BusinessSettings";
import UserProfileSettings from "./UserProfileSettings";
import { UserData } from "@/types/dashboard";

// Mock business data - In a real application, this would come from your backend/state
const businessData = {
  businessId: localStorage.getItem("businessId") || "BUS-123456",
  businessName: localStorage.getItem("businessName") || "Amazing Shop",
  businessCategory: localStorage.getItem("businessCategory") || "Retail",
  phoneNumber: localStorage.getItem("businessPhone") || "+254712345678",
  email: localStorage.getItem("businessEmail") || "business@example.com",
  country: localStorage.getItem("businessCountry") || "Kenya",
  registrationDate: localStorage.getItem("registrationDate") || new Date().toISOString(),
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("business");
  
  // Get user data - In a real app, this would come from context/state management
  const userData: UserData = {
    firstName: localStorage.getItem("firstName") || "Christopher",
    lastName: localStorage.getItem("lastName") || "Njeru",
    businessName: localStorage.getItem("businessName") || "AMAZING SHOP",
    email: localStorage.getItem("email") || "user@example.com",
    phoneNumber: localStorage.getItem("phoneNumber") || "+254712345678",
    role: localStorage.getItem("userRole") || "Admin",
    agentCode: localStorage.getItem("agentCode") || "AG-001",
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6 bg-tellerpos-dark-accent/50">
          <TabsTrigger 
            value="business"
            className="data-[state=active]:bg-tellerpos data-[state=active]:text-white"
          >
            Business Details
          </TabsTrigger>
          <TabsTrigger 
            value="user"
            className="data-[state=active]:bg-tellerpos data-[state=active]:text-white"
          >
            User Profile
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="business" className="mt-0">
          <BusinessSettings businessData={businessData} />
        </TabsContent>
        
        <TabsContent value="user" className="mt-0">
          <UserProfileSettings userData={userData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
