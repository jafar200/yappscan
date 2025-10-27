export enum Role {
  Admin = 'ADMIN',
  Manager = 'MANAGER',
}

export enum View {
  Login,
  Dashboard,
  Branches,
  Menu,
  Orders,
  Reports,
  Settings,
  Marketplace,
  CRM,
  Inventory,
  FinancialReports,
  UserManagement,
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: Role;
  assignedBranchId?: string;
}

export interface MenuItem {
  id:string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  menu: MenuCategory[];
}

export type OrderStatus = 'Pending' | 'Paid' | 'Completed' | 'Cancelled';

export interface Order {
  id:string;
  branchId: string;
  tableNumber: string;
  items: { itemId: string; name: string; quantity: number; price: number }[];
  total: number;
  createdAt: Date;
  status: OrderStatus;
  paymentMethod: 'Cash' | 'Online';
  paymentId?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Setting {
  key: string;
  value: any;
}

export interface MarketplaceTool {
  id: string;
  name: string;
  description: string;
  price: number;
  pricePeriod: 'شهرياً' | 'سنوياً';
  icon: keyof typeof import('./components/Icons').Icons;
  isInstalled: boolean;
  view?: View;
  rating?: number;
  dateAdded?: string;
}