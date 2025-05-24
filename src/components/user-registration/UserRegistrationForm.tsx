
import { useState } from "react";
import { User, Mail, Phone, Lock, EyeIcon, EyeOffIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { userRegistrationSchema, UserRegistrationFormData } from "@/schemas/authSchemas";

interface UserRegistrationFormProps {
  onSubmit: (data: UserRegistrationFormData) => void;
  onSignInClick: () => void;
  isSubmitting: boolean;
  countryCode: string;
}

const UserRegistrationForm = ({
  onSubmit,
  onSignInClick,
  isSubmitting,
  countryCode,
}: UserRegistrationFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<UserRegistrationFormData>({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: countryCode || "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = (data: UserRegistrationFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-6">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">First Name</FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-4 w-4 text-tellerpos/70" />
                </div>
                <FormControl>
                  <Input
                    placeholder="Enter your first name"
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
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Last Name</FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-4 w-4 text-tellerpos/70" />
                </div>
                <FormControl>
                  <Input
                    placeholder="Enter your last name"
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
                    type="email"
                    placeholder="Enter your email"
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
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Phone Number</FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Phone className="h-4 w-4 text-tellerpos/70" />
                </div>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10"
                    {...field}
                  />
                </FormControl>
              </div>
              <p className="text-xs text-gray-400">Including country code (e.g. +254 7XX XXX XXX)</p>
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
                    placeholder="Create password"
                    className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10 pr-10"
                    {...field}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-tellerpos/70" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-tellerpos/70" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400">Must contain uppercase, lowercase, number, and special character</p>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Confirm Password</FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-4 w-4 text-tellerpos/70" />
                </div>
                <FormControl>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className="bg-tellerpos-bg/50 border-tellerpos/20 text-white pl-10 pr-10"
                    {...field}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showConfirmPassword ? (
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
              onClick={onSignInClick}
              className="text-tellerpos hover:text-tellerpos/80 text-sm underline"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default UserRegistrationForm;

