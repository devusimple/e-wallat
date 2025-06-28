import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Search, 
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Trash2,
  Edit3,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useApp } from '@/context/AppContext';
import { Transaction } from '@/types/transaction';
import { DEFAULT_CATEGORIES, CURRENCIES } from '@/constants/categories';

export default function HomeScreen() {
  const theme = useTheme();
  const { state, getTotalIncome, getTotalExpenses, getBalance, deleteTransaction } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const currency = CURRENCIES.find(c => c.code === state.preferences.currency) || CURRENCIES[0];

  const filteredTransactions = state.transactions
    .filter(transaction => {
      const matchesSearch = transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || transaction.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate sync operation
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleDeleteTransaction = (id: string, title: string) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTransaction(id),
        },
      ]
    );
  };

  const formatAmount = (amount: number) => {
    return `${currency.symbol}${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = DEFAULT_CATEGORIES.find(c => c.id === categoryId);
    return category?.icon || 'circle';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = DEFAULT_CATEGORIES.find(c => c.id === categoryId);
    return category?.color || theme.colors.textSecondary;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            Hello there! 👋
          </Text>
          <Text style={[styles.subGreeting, { color: theme.colors.textSecondary }]}>
            Here's your financial overview
          </Text>
        </View>

        {/* Balance Cards */}
        <View style={styles.balanceContainer}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary + 'CC']}
            style={styles.balanceCard}
          >
            <View style={styles.balanceHeader}>
              <Wallet size={24} color="#FFFFFF" />
              <Text style={styles.balanceLabel}>Total Balance</Text>
            </View>
            <Text style={styles.balanceAmount}>
              {formatAmount(getBalance())}
            </Text>
          </LinearGradient>

          <View style={styles.summaryCards}>
            <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.summaryIcon, { backgroundColor: theme.colors.income + '20' }]}>
                <ArrowUpRight size={20} color={theme.colors.income} />
              </View>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Income
              </Text>
              <Text style={[styles.summaryAmount, { color: theme.colors.income }]}>
                {formatAmount(getTotalIncome())}
              </Text>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.summaryIcon, { backgroundColor: theme.colors.expense + '20' }]}>
                <ArrowDownLeft size={20} color={theme.colors.expense} />
              </View>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Expenses
              </Text>
              <Text style={[styles.summaryAmount, { color: theme.colors.expense }]}>
                {formatAmount(getTotalExpenses())}
              </Text>
            </View>
          </View>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInput, { backgroundColor: theme.colors.card }]}>
            <Search size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchText, { color: theme.colors.text }]}
              placeholder="Search transactions..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <View style={styles.filterButtons}>
            {[
              { key: 'all' as const, label: 'All' },
              { key: 'income' as const, label: 'Income' },
              { key: 'expense' as const, label: 'Expense' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: filterType === filter.key
                      ? theme.colors.primary
                      : theme.colors.card,
                  }
                ]}
                onPress={() => setFilterType(filter.key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  {
                    color: filterType === filter.key
                      ? '#FFFFFF'
                      : theme.colors.textSecondary,
                  }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recent Transactions
            </Text>
            <Text style={[styles.transactionCount, { color: theme.colors.textSecondary }]}>
              {filteredTransactions.length} transactions
            </Text>
          </View>

          {filteredTransactions.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
              <Wallet size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No transactions yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                Start by adding your first transaction
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {filteredTransactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={[styles.transactionItem, { backgroundColor: theme.colors.card }]}
                  activeOpacity={0.7}
                >
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: getCategoryColor(transaction.category) + '20' }
                      ]}
                    >
                      <Text style={{ color: getCategoryColor(transaction.category) }}>
                        {transaction.type === 'income' ? '↗️' : '↙️'}
                      </Text>
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={[styles.transactionTitle, { color: theme.colors.text }]}>
                        {transaction.title}
                      </Text>
                      <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
                        {formatDate(new Date(transaction.date))}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.transactionRight}>
                    <Text style={[
                      styles.transactionAmount,
                      {
                        color: transaction.type === 'income'
                          ? theme.colors.income
                          : theme.colors.expense,
                      }
                    ]}>
                      {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                    </Text>
                    
                    <View style={styles.transactionActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteTransaction(transaction.id, transaction.title)}
                      >
                        <Trash2 size={16} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
  },
  balanceContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
    opacity: 0.9,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  transactionCount: {
    fontSize: 14,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  transactionsList: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
});