
export type UnitOfMeasurement = 
  | 'kilograms' 
  | 'grams' 
  | 'litres' 
  | 'millilitres' 
  | 'pieces' 
  | 'bales' 
  | 'boxes' 
  | 'cartons' 
  | 'packs' 
  | 'bottles' 
  | 'cans' 
  | 'bags' 
  | 'pairs' 
  | 'rolls' 
  | 'metres' 
  | 'centimetres' 
  | 'other';

export type ServiceUnitOfMeasurement = 
  | 'hours' 
  | 'minutes' 
  | 'days' 
  | 'weeks' 
  | 'months' 
  | 'sessions' 
  | 'service'
  | 'attempt'
  | 'other';

export type ProductColor = 
  | 'red' 
  | 'blue' 
  | 'green' 
  | 'yellow' 
  | 'purple';

export interface BaseInventoryItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string; 
  color?: ProductColor;
  createdAt: string;
  updatedAt: string;
  category?: string;
}

export interface Product extends BaseInventoryItem {
  type: 'product';
  sku: string;
  barcode?: string;
  quantity: number;
  unitOfMeasurement: UnitOfMeasurement;
  reorderLevel: number;
  costPrice: number;
  stock: number;  // Adding stock property directly
}

export interface Service extends BaseInventoryItem {
  type: 'service';
  isAvailable: boolean;
  unitOfMeasurement: ServiceUnitOfMeasurement;
  duration?: number; // In minutes
  stock: number; // For consistency with Product interface
}

export type InventoryItem = Product | Service;

export interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
}

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  sku: string;
  barcode?: string;
  quantity: number;
  unitOfMeasurement: UnitOfMeasurement;
  reorderLevel: number;
  costPrice: number;
  imageUrl?: string;
  color?: ProductColor;
  useColor: boolean;
  category?: string;
}

export interface ServiceFormValues {
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  unitOfMeasurement: ServiceUnitOfMeasurement;
  duration?: number;
  imageUrl?: string;
  color?: ProductColor;
  useColor: boolean;
  category?: string;
}

export interface ImportProductRow {
  name: string;
  description?: string;
  price: number;
  sku: string;
  barcode?: string;
  quantity: number;
  unitOfMeasurement: string;
  reorderLevel: number;
  costPrice: number;
  category?: string;
}
