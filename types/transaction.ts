export interface Transaction {
  id: string;
  amount: number;
  title: string;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  notes?: string;
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  spent: number;
}

export interface UserPreferences {
  currency: string;
  theme: 'light' | 'dark' | 'system';
  biometricEnabled: boolean;
  pinEnabled: boolean;
  notificationsEnabled: boolean;
  budgetAlerts: boolean;
}