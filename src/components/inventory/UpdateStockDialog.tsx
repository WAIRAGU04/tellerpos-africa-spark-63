
import React, { useState } from 'react';
import { Product } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';

interface UpdateStockDialogProps {
  product: Product;
  onUpdate: (id: string, newQuantity: number, reason: string) => void;
  onCancel: () => void;
}

const UpdateStockDialog: React.FC<UpdateStockDialogProps> = ({ 
  product, 
  onUpdate, 
  onCancel 
}) => {
  const [quantity, setQuantity] = useState<number>(product.quantity);
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (quantity < 0) {
      setError('Quantity cannot be negative');
      return;
    }
    
    if (!reason.trim()) {
      setError('Please provide a reason for this update');
      return;
    }
    
    onUpdate(product.id, quantity, reason);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Product Name</Label>
            <div className="p-2 bg-muted rounded-md">{product.name}</div>
          </div>
          <div>
            <Label>SKU</Label>
            <div className="p-2 bg-muted rounded-md">{product.sku}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="current-quantity">Current Quantity</Label>
          <div className="p-2 bg-muted rounded-md">{product.quantity} {product.unitOfMeasurement}</div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="new-quantity">New Quantity</Label>
          <Input
            id="new-quantity"
            type="number"
            value={quantity}
            onChange={(e) => {
              setQuantity(Number(e.target.value));
              setError(null);
            }}
            min="0"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reason">Reason for Update</Label>
          <Textarea
            id="reason"
            placeholder="e.g., New stock arrival, Stock count correction, etc."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            className="min-h-[100px]"
          />
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Update Stock
        </Button>
      </div>
    </form>
  );
};

export default UpdateStockDialog;
