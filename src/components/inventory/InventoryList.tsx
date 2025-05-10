
import React from 'react';
import { InventoryItem, Product, Service } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface InventoryListProps {
  items: InventoryItem[];
  onAddToCart: (item: InventoryItem) => void;
}

const InventoryList = ({ items, onAddToCart }: InventoryListProps) => {
  // Helper to render the item's small image or color
  const renderItemThumbnail = (item: InventoryItem) => {
    if (item.imageUrl) {
      return (
        <img 
          src={item.imageUrl} 
          alt={item.name}
          className="w-10 h-10 object-cover rounded-md"
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
        <div className={`w-10 h-10 ${colorMap[item.color]} rounded-md flex items-center justify-center`}>
          {item.type === 'product' ? (
            <Package2 className="w-5 h-5 text-white opacity-70" />
          ) : (
            <FileText className="w-5 h-5 text-white opacity-70" />
          )}
        </div>
      );
    }
    
    // Fallback
    return (
      <div className="w-10 h-10 bg-gray-200 dark:bg-tellerpos-dark-accent rounded-md flex items-center justify-center">
        {item.type === 'product' ? (
          <Package2 className="w-5 h-5 text-gray-400" />
        ) : (
          <FileText className="w-5 h-5 text-gray-400" />
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
        return <Badge variant="secondary" className="bg-yellow-500">Low Stock</Badge>;
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {renderItemThumbnail(item)}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {item.type === 'product' ? 'Product' : 'Service'}
                </Badge>
              </TableCell>
              <TableCell>
                {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(item.price)}
              </TableCell>
              <TableCell>
                {renderStockStatus(item)}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => onAddToCart(item)}
                  disabled={(item.type === 'product' && (item as Product).quantity <= 0) || 
                            (item.type === 'service' && !(item as Service).isAvailable)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryList;
