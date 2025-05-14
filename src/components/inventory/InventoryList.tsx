
import React from 'react';
import { InventoryItem, Product, Service } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Edit } from 'lucide-react';
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
  onEdit?: (item: InventoryItem) => void;
}

const InventoryList = ({ items, onAddToCart, onEdit }: InventoryListProps) => {
  // Helper to render status badge
  const renderStatus = (item: InventoryItem) => {
    if (item.type === 'product') {
      const product = item as Product;
      if (product.quantity <= 0) {
        return <Badge variant="destructive">Out of Stock</Badge>;
      } else if (product.quantity <= product.reorderLevel) {
        return <Badge variant="secondary" className="bg-yellow-500">Low Stock</Badge>;
      } else {
        return <Badge variant="outline">In Stock</Badge>;
      }
    } else {
      const service = item as Service;
      return <Badge variant={service.isAvailable ? "outline" : "destructive"}>
        {service.isAvailable ? 'Available' : 'Unavailable'}
      </Badge>;
    }
  };
  
  const getStockInfo = (item: InventoryItem) => {
    if (item.type === 'product') {
      const product = item as Product;
      return `${product.quantity} ${product.unitOfMeasurement}`;
    } else {
      const service = item as Service;
      return service.isAvailable ? 'Available' : 'Unavailable';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>SKU/ID</TableHead>
            <TableHead className="hidden md:table-cell">Price</TableHead>
            <TableHead>Stock/Status</TableHead>
            <TableHead className="hidden md:table-cell">Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</TableCell>
              <TableCell>{item.type === 'product' ? (item as Product).sku : '-'}</TableCell>
              <TableCell className="hidden md:table-cell">
                {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(item.price)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {renderStatus(item)}
                  <span className="text-xs text-muted-foreground">{getStockInfo(item)}</span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {formatDate(item.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8"
                    onClick={() => onAddToCart(item)}
                    disabled={(item.type === 'product' && (item as Product).quantity <= 0) || 
                              (item.type === 'service' && !(item as Service).isAvailable)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" /> 
                    <span className="hidden sm:inline">Add to Cart</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryList;
