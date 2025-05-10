
import React from 'react';
import { InventoryItem, Product, Service } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ShoppingCart, Package2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InventoryGridProps {
  items: InventoryItem[];
  onAddToCart: (item: InventoryItem) => void;
}

const InventoryGrid = ({ items, onAddToCart }: InventoryGridProps) => {
  // Helper to render the item's image or color
  const renderItemVisual = (item: InventoryItem) => {
    if (item.imageUrl) {
      return (
        <img 
          src={item.imageUrl} 
          alt={item.name}
          className="w-full h-36 object-cover rounded-t-md"
        />
      );
    } else if (item.color) {
      const colorMap: Record<string, string> = {
        red: 'bg-red-500',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        purple: 'bg-purple-500',
      };
      
      return (
        <div className={`w-full h-36 ${colorMap[item.color]} rounded-t-md flex items-center justify-center`}>
          {item.type === 'product' ? (
            <Package2 className="w-16 h-16 text-white opacity-50" />
          ) : (
            <FileText className="w-16 h-16 text-white opacity-50" />
          )}
        </div>
      );
    }
    
    // Fallback
    return (
      <div className="w-full h-36 bg-gray-200 dark:bg-tellerpos-dark-accent rounded-t-md flex items-center justify-center">
        {item.type === 'product' ? (
          <Package2 className="w-16 h-16 text-gray-400" />
        ) : (
          <FileText className="w-16 h-16 text-gray-400" />
        )}
      </div>
    );
  };
  
  // Helper to render stock status
  const renderStockStatus = (item: InventoryItem) => {
    if (item.type === 'product') {
      const product = item as Product;
      if (product.quantity <= 0) {
        return <Badge variant="destructive">Out of Stock</Badge>;
      } else if (product.quantity <= product.reorderLevel) {
        return <Badge variant="warning" className="bg-yellow-500">Low Stock</Badge>;
      } else {
        return <Badge variant="outline">{product.quantity} {product.unitOfMeasurement}</Badge>;
      }
    } else {
      const service = item as Service;
      return (
        <Badge variant={service.isAvailable ? "outline" : "destructive"}>
          {service.isAvailable ? 'Available' : 'Unavailable'}
        </Badge>
      );
    }
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden flex flex-col">
          {renderItemVisual(item)}
          
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pb-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">
                {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(item.price)}
              </span>
              {renderStockStatus(item)}
            </div>
          </CardContent>
          
          <CardFooter className="mt-auto pt-2">
            <Button 
              className="w-full" 
              variant="default"
              onClick={() => onAddToCart(item)}
              disabled={(item.type === 'product' && (item as Product).quantity <= 0) || 
                        (item.type === 'service' && !(item as Service).isAvailable)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default InventoryGrid;
