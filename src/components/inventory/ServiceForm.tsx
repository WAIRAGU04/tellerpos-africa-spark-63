
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ServiceFormValues, ServiceUnitOfMeasurement, ProductColor } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const serviceUnitsOfMeasurement: ServiceUnitOfMeasurement[] = [
  'hours',
  'minutes',
  'days',
  'weeks',
  'months',
  'sessions',
  'service',
  'attempt',
  'other'
];

const serviceColors: ProductColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string(),
  price: z.number().positive('Price must be positive'),
  isAvailable: z.boolean().default(true),
  unitOfMeasurement: z.enum(serviceUnitsOfMeasurement as [ServiceUnitOfMeasurement, ...ServiceUnitOfMeasurement[]]),
  duration: z.number().min(0).optional(),
  imageUrl: z.string().optional(),
  color: z.enum(serviceColors as [ProductColor, ...ProductColor[]]).optional(),
  useColor: z.boolean().default(false),
});

interface ServiceFormProps {
  onSubmit: (data: Omit<ServiceFormValues, 'useColor'>) => void;
  onCancel: () => void;
  initialData?: Partial<ServiceFormValues>;
}

const ServiceForm = ({ onSubmit, onCancel, initialData }: ServiceFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      isAvailable: initialData?.isAvailable !== undefined ? initialData.isAvailable : true,
      unitOfMeasurement: initialData?.unitOfMeasurement || 'service',
      duration: initialData?.duration || 0,
      imageUrl: initialData?.imageUrl || '',
      color: initialData?.color || 'purple',
      useColor: initialData?.useColor || false,
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      
      // Create a URL for the file
      const fileUrl = URL.createObjectURL(e.target.files[0]);
      form.setValue('imageUrl', fileUrl);
    }
  };
  
  const handleFormSubmit = (data: ServiceFormValues) => {
    const { useColor, ...serviceData } = data;
    
    // If using color instead of image, remove imageUrl
    if (useColor) {
      serviceData.imageUrl = undefined;
    } else {
      serviceData.color = undefined;
    }
    
    onSubmit(serviceData);
  };
  
  const colorSwatch = (color: ProductColor) => {
    const colorMap: Record<ProductColor, string> = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
    };
    
    return (
      <div 
        className={`w-6 h-6 rounded-full ${colorMap[color]} border border-gray-300 dark:border-gray-600`}
      />
    );
  };
  
  const showDurationField = ['hours', 'minutes', 'days', 'weeks', 'months'].includes(form.watch('unitOfMeasurement'));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter service name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter service description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Service Availability</FormLabel>
                    <FormDescription>
                      Is this service currently available?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unitOfMeasurement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Service</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      if (!['hours', 'minutes', 'days', 'weeks', 'months'].includes(value)) {
                        form.setValue('duration', undefined);
                      }
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {serviceUnitsOfMeasurement.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit.charAt(0).toUpperCase() + unit.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {showDurationField && (
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          value={field.value || ''}
                          onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} 
                        />
                      </FormControl>
                      <FormDescription>
                        Duration in {form.watch('unitOfMeasurement')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <FormField
              control={form.control}
              name="useColor"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Use Color Instead of Image</FormLabel>
                    <FormDescription>
                      Choose a solid color instead of uploading an image
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {form.watch('useColor') ? (
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Color</FormLabel>
                    <div className="flex gap-2">
                      {serviceColors.map((color) => (
                        <div
                          key={color}
                          onClick={() => field.onChange(color)}
                          className={`w-10 h-10 cursor-pointer rounded-full flex items-center justify-center p-0.5 ${
                            field.value === color ? 'border-2 border-tellerpos' : ''
                          }`}
                        >
                          {colorSwatch(color)}
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-2">
                <Label htmlFor="service-image">Service Image</Label>
                <div className="grid gap-2">
                  <Input
                    id="service-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  
                  {selectedFile && (
                    <Card className="p-2 flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Service preview"
                        className="max-h-40 object-contain"
                      />
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Add Service
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceForm;
