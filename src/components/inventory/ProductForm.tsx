
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProductFormValues, UnitOfMeasurement, ProductColor } from '@/types/inventory';
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

const unitsOfMeasurement: UnitOfMeasurement[] = [
  'kilograms',
  'grams',
  'litres',
  'millilitres',
  'pieces',
  'bales',
  'boxes',
  'cartons',
  'packs',
  'bottles',
  'cans',
  'bags',
  'pairs',
  'rolls',
  'metres',
  'centimetres',
  'other'
];

const productColors: ProductColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string(),
  price: z.number().positive('Price must be positive'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  unitOfMeasurement: z.enum(unitsOfMeasurement as [UnitOfMeasurement, ...UnitOfMeasurement[]]),
  reorderLevel: z.number().min(0, 'Reorder level cannot be negative'),
  costPrice: z.number().min(0, 'Cost price cannot be negative'),
  imageUrl: z.string().optional(),
  color: z.enum(productColors as [ProductColor, ...ProductColor[]]).optional(),
  useColor: z.boolean().default(false),
});

interface ProductFormProps {
  onSubmit: (data: Omit<ProductFormValues, 'useColor'>) => void;
  onCancel: () => void;
  initialData?: Partial<ProductFormValues>;
}

const ProductForm = ({ onSubmit, onCancel, initialData }: ProductFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      sku: initialData?.sku || '',
      barcode: initialData?.barcode || '',
      quantity: initialData?.quantity || 0,
      unitOfMeasurement: initialData?.unitOfMeasurement || 'pieces',
      reorderLevel: initialData?.reorderLevel || 5,
      costPrice: initialData?.costPrice || 0,
      imageUrl: initialData?.imageUrl || '',
      color: initialData?.color || 'blue',
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
  
  const handleFormSubmit = (data: ProductFormValues) => {
    const { useColor, ...productData } = data;
    
    // If using color instead of image, remove imageUrl
    if (useColor) {
      productData.imageUrl = undefined;
    } else {
      productData.color = undefined;
    }
    
    onSubmit(productData);
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
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
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
                    <Textarea placeholder="Enter product description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price</FormLabel>
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
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price</FormLabel>
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
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="SKU001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
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
                name="unitOfMeasurement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitsOfMeasurement.map((unit) => (
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
            </div>
            
            <FormField
              control={form.control}
              name="reorderLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Level</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="5" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))} 
                    />
                  </FormControl>
                  <FormDescription>
                    Stock level at which you'd like to be notified to reorder
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                    <FormLabel>Product Color</FormLabel>
                    <div className="flex gap-2">
                      {productColors.map((color) => (
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
                <Label htmlFor="product-image">Product Image</Label>
                <div className="grid gap-2">
                  <Input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  
                  {selectedFile && (
                    <Card className="p-2 flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Product preview"
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
            Add Product
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
