import { useColorScheme } from 'react-native';
import { useApp } from '@/context/AppContext';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    income: string;
    expense: string;
    success: string;
    warning: string;
    error: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    income: '#10B981',
    expense: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};

const darkTheme: Theme = {
  colors: {
    primary: '#60A5FA',
    secondary: '#9CA3AF',
    background: '#111827',
    surface: '#1F2937',
    card: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    income: '#34D399',
    expense: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};

export function useTheme(): Theme {
  const { state } = useApp();
  const systemColorScheme = useColorScheme();
  
  const activeTheme = state.preferences.theme === 'system' 
    ? systemColorScheme 
    : state.preferences.theme;
    
  return activeTheme === 'dark' ? darkTheme : lightTheme;
}