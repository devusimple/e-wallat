import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Settings, 
  Shield, 
  Download, 
  Upload, 
  Moon, 
  Sun, 
  Smartphone, 
  Bell, 
  DollarSign,
  HelpCircle,
  MessageSquare,
  LogOut,
  Trash2,
  FileText,
  Lock,
  Fingerprint,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useApp } from '@/context/AppContext';
import { CURRENCIES } from '@/constants/categories';

export default function MenuScreen() {
  const theme = useTheme();
  const { state, dispatch } = useApp();
  const [isExporting, setIsExporting] = useState(false);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    dispatch({
      type: 'SET_PREFERENCES',
      payload: {
        ...state.preferences,
        theme: newTheme,
      },
    });
  };

  const handleCurrencyChange = () => {
    Alert.alert(
      'Change Currency',
      'Select your preferred currency',
      CURRENCIES.map(currency => ({
        text: `${currency.symbol} ${currency.name}`,
        onPress: () => {
          dispatch({
            type: 'SET_PREFERENCES',
            payload: {
              ...state.preferences,
              currency: currency.code,
            },
          });
        },
      }))
    );
  };

  const handleNotificationToggle = (enabled: boolean) => {
    dispatch({
      type: 'SET_PREFERENCES',
      payload: {
        ...state.preferences,
        notificationsEnabled: enabled,
      },
    });
  };

  const handleBudgetAlertsToggle = (enabled: boolean) => {
    dispatch({
      type: 'SET_PREFERENCES',
      payload: {
        ...state.preferences,
        budgetAlerts: enabled,
      },
    });
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        transactions: state.transactions,
        preferences: state.preferences,
        budgets: state.budgets,
        exportDate: new Date().toISOString(),
      };

      const dataString = JSON.stringify(exportData, null, 2);
      
      await Share.share({
        message: dataString,
        title: 'E-Wallet Data Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your transactions, budgets, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
            dispatch({ type: 'SET_BUDGETS', payload: [] });
            Alert.alert('Success', 'All data has been cleared');
          },
        },
      ]
    );
  };

  const currentCurrency = CURRENCIES.find(c => c.code === state.preferences.currency) || CURRENCIES[0];

  const getThemeIcon = () => {
    switch (state.preferences.theme) {
      case 'light':
        return <Sun size={20} color={theme.colors.textSecondary} />;
      case 'dark':
        return <Moon size={20} color={theme.colors.textSecondary} />;
      default:
        return <Smartphone size={20} color={theme.colors.textSecondary} />;
    }
  };

  const getThemeLabel = () => {
    switch (state.preferences.theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      default:
        return 'System';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Menu
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Settings and preferences
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.profileContainer}>
            <View style={[styles.profileIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <User size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                E-Wallet User
              </Text>
              <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
                {state.transactions.length} transactions recorded
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Preferences
          </Text>
          
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                Alert.alert(
                  'Theme',
                  'Choose your preferred theme',
                  [
                    { text: 'Light', onPress: () => handleThemeChange('light') },
                    { text: 'Dark', onPress: () => handleThemeChange('dark') },
                    { text: 'System', onPress: () => handleThemeChange('system') },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            >
              <View style={styles.menuItemLeft}>
                {getThemeIcon()}
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                  Theme
                </Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={[styles.menuItemValue, { color: theme.colors.textSecondary }]}>
                  {getThemeLabel()}
                </Text>
                <ChevronRight size={16} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleCurrencyChange}>
              <View style={styles.menuItemLeft}>
                <DollarSign size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                  Currency
                </Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={[styles.menuItemValue, { color: theme.colors.textSecondary }]}>
                  {currentCurrency.code}
                </Text>
                <ChevronRight size={16} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Bell size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                  Notifications
                </Text>
              </View>
              <Switch
                value={state.preferences.notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={state.preferences.notificationsEnabled ? theme.colors.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <MessageSquare size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                  Budget Alerts
                </Text>
              </View>
              <Switch
                value={state.preferences.budgetAlerts}
                onValueChange={handleBudgetAlertsToggle}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '40' }}
                thumbColor={state.preferences.budgetAlerts ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Security
          </Text>
          
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Lock size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                  PIN Lock
                </Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={[styles.menuItemValue, { color: theme.colors.textSecondary }]}>
                  {state.preferences.pinEnabled ? 'Enabled' : 'Disabled'}
                </Text>
                <ChevronRight size={16} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Fingerprint size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                  Biometric Lock
                </Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={[styles.menuItemValue, { color: theme.colors.textSecondary }]}>
                  {state.preferences.biometricEnabled ? 'Enabled' : 'Disabled'}
                </Text>
                <ChevronRight size={16} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Data Management
          </Text>
          
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handleExportData}>
              <View style={styles.menuItemLeft}>
                <Download size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                  Export Data
                </Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={[styles.menuItemValue, { color: theme.colors.textSecondary }]}>
                  {isExporting ? 'Exporting...' : 'JSON'}
                </Text>
                <ChevronRight size={16} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Upload size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                  Backup to Cloud
                </Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={[styles.menuItemValue, { color: theme.colors.textSecondary }]}>
                  Manual
                </Text>
                <ChevronRight size={16} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleClearData}>
              <View style={styles.menuItemLeft}>
                <Trash2 size={20} color={theme.colors.error} />
                <Text style={[styles.menuItemText, { color: theme.colors.error }]}>
                  Clear All Data
                </Text>
              </View>
              <ChevronRight size={16} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Support
          </Text>
          
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <HelpCircle size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                  Help Center
                </Text>
              </View>
              <ChevronRight size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <MessageSquare size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                  Contact Support
                </Text>
              </View>
              <ChevronRight size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <FileText size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                  Privacy Policy
                </Text>
              </View>
              <ChevronRight size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appVersion, { color: theme.colors.textSecondary }]}>
            E-Wallet Tracker v1.0.0
          </Text>
          <Text style={[styles.appSubtitle, { color: theme.colors.textSecondary }]}>
            Offline-first expense manager
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontSize: 14,
    marginRight: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 12,
  },
});