import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, UserPreferences, Budget } from '@/types/transaction';
import { DEFAULT_CATEGORIES } from '@/constants/categories';

interface AppState {
  transactions: Transaction[];
  preferences: UserPreferences;
  budgets: Budget[];
  isOnboarded: boolean;
  syncQueue: string[];
  isOnline: boolean;
}

type AppAction =
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_PREFERENCES'; payload: UserPreferences }
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'SET_ONBOARDED'; payload: boolean }
  | { type: 'ADD_TO_SYNC_QUEUE'; payload: string }
  | { type: 'REMOVE_FROM_SYNC_QUEUE'; payload: string }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean };

const initialState: AppState = {
  transactions: [],
  preferences: {
    currency: 'USD',
    theme: 'system',
    biometricEnabled: false,
    pinEnabled: false,
    notificationsEnabled: true,
    budgetAlerts: true,
  },
  budgets: [],
  isOnboarded: false,
  syncQueue: [],
  isOnline: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload };
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    case 'SET_ONBOARDED':
      return { ...state, isOnboarded: action.payload };
    case 'ADD_TO_SYNC_QUEUE':
      return { ...state, syncQueue: [...state.syncQueue, action.payload] };
    case 'REMOVE_FROM_SYNC_QUEUE':
      return { 
        ...state, 
        syncQueue: state.syncQueue.filter(id => id !== action.payload) 
      };
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'synced'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  saveData: () => Promise<void>;
  loadData: () => Promise<void>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'synced'>) => {
    const transaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      synced: false,
    };
    
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    dispatch({ type: 'ADD_TO_SYNC_QUEUE', payload: transaction.id });
  };

  const updateTransaction = (transaction: Transaction) => {
    const updatedTransaction = {
      ...transaction,
      updatedAt: new Date(),
      synced: false,
    };
    
    dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
    dispatch({ type: 'ADD_TO_SYNC_QUEUE', payload: transaction.id });
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    dispatch({ type: 'ADD_TO_SYNC_QUEUE', payload: id });
  };

  const getTotalIncome = () => {
    return state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('ewallet_transactions', JSON.stringify(state.transactions));
      await AsyncStorage.setItem('ewallet_preferences', JSON.stringify(state.preferences));
      await AsyncStorage.setItem('ewallet_budgets', JSON.stringify(state.budgets));
      await AsyncStorage.setItem('ewallet_onboarded', JSON.stringify(state.isOnboarded));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const loadData = async () => {
    try {
      const [transactions, preferences, budgets, onboarded] = await Promise.all([
        AsyncStorage.getItem('ewallet_transactions'),
        AsyncStorage.getItem('ewallet_preferences'),
        AsyncStorage.getItem('ewallet_budgets'),
        AsyncStorage.getItem('ewallet_onboarded'),
      ]);

      if (transactions) {
        const parsedTransactions = JSON.parse(transactions).map((t: any) => ({
          ...t,
          date: new Date(t.date),
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        }));
        dispatch({ type: 'SET_TRANSACTIONS', payload: parsedTransactions });
      }

      if (preferences) {
        dispatch({ type: 'SET_PREFERENCES', payload: JSON.parse(preferences) });
      }

      if (budgets) {
        dispatch({ type: 'SET_BUDGETS', payload: JSON.parse(budgets) });
      }

      if (onboarded) {
        dispatch({ type: 'SET_ONBOARDED', payload: JSON.parse(onboarded) });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [state.transactions, state.preferences, state.budgets, state.isOnboarded]);

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getTotalIncome,
      getTotalExpenses,
      getBalance,
      saveData,
      loadData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}