
export type UserRole = 'admin' | 'agent';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Drink {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

export interface OrderItem {
  drinkId: string;
  drinkName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  date: Date;
  agentId: string;
  agentName: string;
  completed: boolean;
}

export interface TimeLog {
  id: string;
  userId: string;
  userName: string;
  clockIn: Date;
  clockOut?: Date;
  date: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: Date;
}

export interface LoginActivity {
  id: string;
  userId: string;
  userName: string;
  loginTime: Date;
  date: string;
}

export interface Revenue {
  date: string;
  amount: number;
}

export interface Table {
  id: string;
  number: number;
  zone: string;
  status: 'available' | 'occupied' | 'ordering';
  currentOrderId?: string;
}

export interface TableOrder {
  id: string;
  tableId: string;
  tableNumber: number;
  items: OrderItem[];
  total: number;
  date: Date;
  agentId: string;
  agentName: string;
  status: 'pending' | 'completed';
}
