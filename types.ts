
export type UserRole = 'admin' | 'accountant' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  currentBalance: number; // بالريال السعودي
  status?: UserStatus;
}

export type TransactionType = 'revenue' | 'expense' | 'settlement';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  description: string;
  amount: number;
  currency: 'SAR' | 'USD';
  exchangeRate: number;
  bookingNumber?: string;
  notes?: string;
  timestamp: number;
  archivedAt?: string | null; // تاريخ الأرشفة الإدارية
}
