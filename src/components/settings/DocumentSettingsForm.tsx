
import React, { useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusinessSettings } from "@/types/dashboard";
import { PenLine, Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

const documentSettingsSchema = z.object({
  currency: z.string().min(1, "Currency is required"),
  documentFooters: z.object({
    receipt: z.string().optional(),
    invoice: z.string().optional(),
    quotation: z.string().optional(),
    purchaseOrder: z.string().optional(),
    deliveryNote: z.string().optional(),
  }),
  logo: z.string().optional(),
  signature: z.string().optional(),
});

type DocumentSettingsFormValues = z.infer<typeof documentSettingsSchema>;

interface DocumentSettingsFormProps {
  initialData: Partial<BusinessSettings>;
  onSave: (data: Partial<BusinessSettings>) => void;
  isSaving: boolean;
}

const DocumentSettingsForm: React.FC<DocumentSettingsFormProps> = ({
  initialData,
  onSave,
  isSaving,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penThickness, setPenThickness] = useState(3);
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);
  
  // Form setup
  const form = useForm<DocumentSettingsFormValues>({
    resolver: zodResolver(documentSettingsSchema),
    defaultValues: {
      currency: initialData.currency || "KES",
      documentFooters: {
        receipt: initialData.documentFooters?.receipt || "Thank you for shopping with us!",
        invoice: initialData.documentFooters?.invoice || "Payment terms: 30 days net",
        quotation: initialData.documentFooters?.quotation || "This quotation is valid for 30 days",
        purchaseOrder: initialData.documentFooters?.purchaseOrder || "Standard terms and conditions apply",
        deliveryNote: initialData.documentFooters?.deliveryNote || "Please check goods before signing",
      },
      logo: initialData.logo || "",
      signature: initialData.signature || "",
    },
  });
  
  // Available currencies
  const currencies = [
    { code: "KES", name: "Kenyan Shilling (KES)" },
    { code: "USD", name: "US Dollar (USD)" },
    { code: "EUR", name: "Euro (EUR)" },
    { code: "GBP", name: "British Pound (GBP)" },
    { code: "NGN", name: "Nigerian Naira (NGN)" },
    { code: "ZAR", name: "South African Rand (ZAR)" },
    { code: "GHS", name: "Ghanaian Cedi (GHS)" },
    { code: "UGX", name: "Ugandan Shilling (UGX)" },
    { code: "TZS", name: "Tanzanian Shilling (TZS)" },
    { code: "RWF", name: "Rwandan Franc (RWF)" },
  ];
  
  const onSubmit = (data: DocumentSettingsFormValues) => {
    onSave(data);
  };
  
  // Logo upload handlers
  const handleLogoUploadClick = () => {
    if (logoInputRef.current) {
      logoInputRef.current.click();
    }
  };
  
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      form.setValue("logo", result);
    };
    reader.readAsDataURL(file);
  };
  
  // Signature canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!signatureCanvasRef.current) return;
    
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    // Get canvas position
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      // Touch event
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
      
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !signatureCanvasRef.current) return;
    
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get current position
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      // Touch event
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.lineWidth = penThickness;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    if (!isDrawing || !signatureCanvasRef.current) return;
    
    setIsDrawing(false);
  };
  
  const clearSignature = () => {
    if (!signatureCanvasRef.current) return;
    
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  const saveSignature = () => {
    if (!signatureCanvasRef.current) return;
    
    const canvas = signatureCanvasRef.current;
    const signatureDataUrl = canvas.toDataURL("image/png");
    
    form.setValue("signature", signatureDataUrl);
    setShowSignatureCanvas(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>
                Set the default currency for all financial documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This currency will be used on all invoices, quotations, and receipts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Business Branding</CardTitle>
              <CardDescription>
                Upload your logo and signature for use on documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <FormLabel>Business Logo</FormLabel>
                <div className="mt-2 flex flex-col items-center">
                  <input 
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {form.getValues("logo") ? (
                    <div className="mb-4 flex flex-col items-center">
                      <img 
                        src={form.getValues("logo")} 
                        alt="Business Logo" 
                        className="max-h-32 mb-2 border rounded p-2" 
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleLogoUploadClick}
                      >
                        Change Logo
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleLogoUploadClick}
                      className="flex items-center"
                    >
                      <Upload className="mr-2 h-4 w-4" /> Upload Logo
                    </Button>
                  )}
                  <FormDescription className="text-center mt-2">
                    Recommended size: 400x100px. Max file size: 2MB.
                  </FormDescription>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <FormLabel>Authorized Signature</FormLabel>
                <div className="mt-2 flex flex-col items-center">
                  {form.getValues("signature") && !showSignatureCanvas ? (
                    <div className="mb-4 flex flex-col items-center">
                      <img 
                        src={form.getValues("signature")} 
                        alt="Authorized Signature" 
                        className="max-h-32 mb-2 border rounded p-2 bg-white" 
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowSignatureCanvas(true)}
                      >
                        Change Signature
                      </Button>
                    </div>
                  ) : (
                    !showSignatureCanvas && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowSignatureCanvas(true)}
                        className="flex items-center"
                      >
                        <PenLine className="mr-2 h-4 w-4" /> Add Signature
                      </Button>
                    )
                  )}
                  
                  {showSignatureCanvas && (
                    <div className="w-full border rounded-md p-4 bg-white">
                      <div className="flex items-center gap-4 mb-2">
                        <FormLabel className="min-w-24">Pen Thickness</FormLabel>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[penThickness]}
                          onValueChange={(values) => setPenThickness(values[0])}
                          className="w-[180px]"
                        />
                        <span className="text-sm">{penThickness}px</span>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <canvas
                          ref={signatureCanvasRef}
                          width={600}
                          height={200}
                          className="bg-white w-full cursor-crosshair touch-none"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-2">
                        <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                          Clear
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowSignatureCanvas(false)}>
                          Cancel
                        </Button>
                        <Button type="button" size="sm" onClick={saveSignature}>
                          Save Signature
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <FormDescription className="text-center mt-2">
                    This signature will appear on your quotations and other documents.
                  </FormDescription>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Document Footers</CardTitle>
              <CardDescription>
                Customize the footer text for different types of documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="documentFooters.receipt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receipt Footer</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
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
                    <FormLabel>Invoice Footer</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
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
                    <FormLabel>Quotation Footer</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
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
                    <FormLabel>Purchase Order Footer</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
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
                    <FormLabel>Delivery Note Footer</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Document Settings"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
};

export default DocumentSettingsForm;
