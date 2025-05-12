
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
import { Mail, Lock, EyeIcon, EyeOffIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ForgotPasswordDialog from "./ForgotPasswordDialog";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define form schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

const SignInDialog = ({ open, onOpenChange }: SignInDialogProps) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call / authentication check
    setTimeout(() => {
      // For demo purposes, we'll accept any valid form data
      // In a real app, you'd verify credentials against a backend

      // Mock user data - in a real app this would come from your authentication API
      const mockUserData = {
        firstName: "Demo",
        lastName: "User",
        email: data.email,
        phoneNumber: "+254700000000",
        role: "Administrator",
        businessName: "TellerPOS Demo Business"
      };

      // Save mock user data to localStorage for testing
      localStorage.setItem("userData", JSON.stringify(mockUserData));
      
      // Also store the business name for the business data
      const businessData = localStorage.getItem("businessData");
      if (!businessData) {
        localStorage.setItem("businessData", JSON.stringify({
          businessName: "TellerPOS Demo Business",
          email: data.email,
          currency: "KES"
        }));
      }
      
      setIsSubmitting(false);
      
      toast.success("Signed in successfully!", {
        description: `Welcome back to TellerPOS!`,
      });
      
      // Close the dialog
      onOpenChange(false);
      
      // Redirect to dashboard
      navigate("/dashboard");
    }, 1500);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    onOpenChange(false);
    setForgotPasswordOpen(true);
  };
  
  return (
    <>
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
                  
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={handleForgotPassword}
                    className="w-full text-tellerpos hover:text-tellerpos/80 hover:bg-transparent mt-4"
                  >
                    Forgot Password?
                  </Button>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <ForgotPasswordDialog 
        open={forgotPasswordOpen} 
        onOpenChange={setForgotPasswordOpen} 
      />
    </>
  );
};

export default SignInDialog;
