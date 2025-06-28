import { Category } from '@/types/transaction';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  { id: '1', name: 'Food & Dining', icon: 'utensils', color: '#EF4444', type: 'expense' },
  { id: '2', name: 'Transportation', icon: 'car', color: '#F97316', type: 'expense' },
  { id: '3', name: 'Shopping', icon: 'shopping-bag', color: '#8B5CF6', type: 'expense' },
  { id: '4', name: 'Entertainment', icon: 'film', color: '#EC4899', type: 'expense' },
  { id: '5', name: 'Bills & Utilities', icon: 'zap', color: '#F59E0B', type: 'expense' },
  { id: '6', name: 'Healthcare', icon: 'heart', color: '#EF4444', type: 'expense' },
  { id: '7', name: 'Education', icon: 'book', color: '#3B82F6', type: 'expense' },
  { id: '8', name: 'Travel', icon: 'plane', color: '#06B6D4', type: 'expense' },
  { id: '9', name: 'Housing', icon: 'home', color: '#84CC16', type: 'expense' },
  { id: '10', name: 'Personal Care', icon: 'scissors', color: '#F59E0B', type: 'expense' },
  
  // Income Categories
  { id: '11', name: 'Salary', icon: 'briefcase', color: '#10B981', type: 'income' },
  { id: '12', name: 'Freelance', icon: 'laptop', color: '#10B981', type: 'income' },
  { id: '13', name: 'Investment', icon: 'trending-up', color: '#10B981', type: 'income' },
  { id: '14', name: 'Gift', icon: 'gift', color: '#10B981', type: 'income' },
  { id: '15', name: 'Business', icon: 'building', color: '#10B981', type: 'income' },
  { id: '16', name: 'Other Income', icon: 'plus-circle', color: '#10B981', type: 'income' },
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
];