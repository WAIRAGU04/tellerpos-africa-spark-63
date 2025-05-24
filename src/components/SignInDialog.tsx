
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, Mail, Lock, EyeIcon, EyeOffIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signInSchema, SignInFormData } from "@/schemas/authSchemas";
import { useSignIn } from "@/hooks/useSignIn";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignInDialog = ({ open, onOpenChange }: SignInDialogProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isSubmitting, navigateToForgotPassword, navigateToBusinessRecovery } = useSignIn();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      businessId: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    const result = await signIn(data);
    if (result.success) {
      onOpenChange(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    onOpenChange(false);
    navigateToForgotPassword();
  };
  
  const handleForgotBusinessId = () => {
    onOpenChange(false);
    navigateToBusinessRecovery();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-tellerpos-dark-accent border-tellerpos/30">
        <ScrollArea className="max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Sign In</DialogTitle>
            <DialogDescription className="text-gray-300">
              Access your TellerPOS account
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
              <FormField
                control={form.control}
                name="businessId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Business ID</FormLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Briefcase className="h-4 w-4 text-tellerpos/70" />
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Enter your Business ID (e.g. TP-001)"
                          className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Mail className="h-4 w-4 text-tellerpos/70" />
                      </div>
                      <FormControl>
                        <Input
                          placeholder="your.email@example.com"
                          className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Password</FormLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Lock className="h-4 w-4 text-tellerpos/70" />
                      </div>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10 pr-10"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={toggleShowPassword}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4 text-tellerpos/70" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-tellerpos/70" />
                        )}
                      </button>
                    </div>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <div className="w-full">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-tellerpos hover:bg-tellerpos/90 text-white"
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={handleForgotBusinessId}
                    className="text-tellerpos hover:text-tellerpos/80 hover:bg-transparent text-sm"
                  >
                    Forgot Business ID?
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={handleForgotPassword}
                    className="text-tellerpos hover:text-tellerpos/80 hover:bg-transparent text-sm"
                  >
                    Forgot Password?
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SignInDialog;
