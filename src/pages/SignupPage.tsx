
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BusinessRegistrationDialog from "@/components/business-registration/BusinessRegistrationDialog";
import SignInDialog from "@/components/SignInDialog";

const SignupPage = () => {
  const [activeTab, setActiveTab] = useState("register");
  const [businessDialogOpen, setBusinessDialogOpen] = useState(true);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "register") {
      setBusinessDialogOpen(true);
      setSignInDialogOpen(false);
    } else if (value === "login") {
      setBusinessDialogOpen(false);
      setSignInDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-tellerpos-bg">
      {/* Header */}
      <div className="bg-tellerpos-dark-accent py-6 px-4">
        <div className="container mx-auto">
          <a href="/" className="flex items-center">
            <span className="text-2xl font-bold text-white">
              TellerPOS
            </span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Get Started with TellerPOS</h1>
            <p className="text-gray-300">Create an account or sign in to continue</p>
          </div>

          <Tabs
            defaultValue="register"
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full bg-tellerpos-dark-accent/50">
              <TabsTrigger value="register" className="data-[state=active]:bg-tellerpos data-[state=active]:text-white">
                Register
              </TabsTrigger>
              <TabsTrigger value="login" className="data-[state=active]:bg-tellerpos data-[state=active]:text-white">
                Sign In
              </TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="register" className="mt-0">
                <div className="bg-tellerpos-dark-accent/30 p-6 rounded-lg">
                  <BusinessRegistrationDialog 
                    open={businessDialogOpen} 
                    onOpenChange={setBusinessDialogOpen} 
                  />
                </div>
              </TabsContent>
              <TabsContent value="login" className="mt-0">
                <div className="bg-tellerpos-dark-accent/30 p-6 rounded-lg">
                  <SignInDialog 
                    open={signInDialogOpen} 
                    onOpenChange={setSignInDialogOpen} 
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
