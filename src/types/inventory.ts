
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
}

export interface Product extends BaseInventoryItem {
  type: 'product';
  sku: string;
  barcode?: string;
  quantity: number;
  unitOfMeasurement: UnitOfMeasurement;
  reorderLevel: number;
  costPrice: number;
}

export interface Service extends BaseInventoryItem {
  type: 'service';
  isAvailable: boolean;
  unitOfMeasurement: ServiceUnitOfMeasurement;
  duration?: number; // In minutes
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
}
