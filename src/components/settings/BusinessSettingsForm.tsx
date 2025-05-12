
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BusinessSettings } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const businessSettingsSchema = z.object({
  businessId: z.string().optional(),
  businessName: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
  address: z.string().optional(),
  postalAddress: z.string().optional(),
  logo: z.string().optional(),
  taxPin: z.string().optional(),
  businessHours: z.object({
    openingTime: z.string().min(1, "Opening time is required"),
    closingTime: z.string().min(1, "Closing time is required"),
    dailyReportTime: z.string().min(1, "Daily report time is required"),
  }),
  documentFooters: z.object({
    receipt: z.string().optional(),
    invoice: z.string().optional(),
    quotation: z.string().optional(),
    purchaseOrder: z.string().optional(),
    deliveryNote: z.string().optional(),
  }),
});

interface BusinessSettingsFormProps {
  initialData?: Partial<BusinessSettings>;
  onSave: (data: BusinessSettings) => void;
  isSaving: boolean;
}

const BusinessSettingsForm: React.FC<BusinessSettingsFormProps> = ({
  initialData,
  onSave,
  isSaving,
}) => {
  const defaultValues: Partial<BusinessSettings> = {
    businessId: "",
    businessName: "",
    email: "",
    phone: "",
    country: "",
    address: "",
    postalAddress: "",
    taxPin: "",
    businessHours: {
      openingTime: "08:00",
      closingTime: "18:00",
      dailyReportTime: "20:00",
    },
    documentFooters: {
      receipt: "",
      invoice: "",
      quotation: "",
      purchaseOrder: "",
      deliveryNote: "",
    },
    ...initialData,
  };

  const form = useForm<BusinessSettings>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues,
  });

  const onSubmit = (data: BusinessSettings) => {
    onSave(data);
    toast.success("Settings saved successfully");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="hours">Business Hours</TabsTrigger>
            <TabsTrigger value="additional">Additional Info</TabsTrigger>
            <TabsTrigger value="footers">Document Footers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update your business's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter business name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter business email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter business phone number" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter business address" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter business ID" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>
                  Configure your business's operating hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="businessHours.openingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Time *</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessHours.closingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Time *</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessHours.dailyReportTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Report Time *</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="additional">
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Add more details about your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="postalAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Address (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="E.g P.O Box 123 Nairobi" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="taxPin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax PIN (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter business tax PIN no." 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter logo URL or upload image" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="footers">
            <Card>
              <CardHeader>
                <CardTitle>Document Footers</CardTitle>
                <CardDescription>
                  Customize footer notes for different document types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="documentFooters.receipt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receipt Footer (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter receipt footer notes"
                          className="min-h-24"
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="documentFooters.invoice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Footer (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter invoice footer notes"
                          className="min-h-24"
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="documentFooters.quotation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quotation Footer (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter quotation footer notes"
                          className="min-h-24"
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="documentFooters.purchaseOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Order Footer (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter purchase order footer notes"
                          className="min-h-24"
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="documentFooters.deliveryNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Note Footer (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter delivery note footer notes"
                          className="min-h-24"
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BusinessSettingsForm;
