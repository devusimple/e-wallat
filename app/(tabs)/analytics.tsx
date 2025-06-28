import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown as TrendingDownIcon,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useApp } from '@/context/AppContext';
import { DEFAULT_CATEGORIES, CURRENCIES } from '@/constants/categories';

const { width } = Dimensions.get('window');
const chartWidth = width - 48;

type TimePeriod = 'week' | 'month' | '3months' | 'year';

export default function AnalyticsScreen() {
  const theme = useTheme();
  const { state } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const [activeChart, setActiveChart] = useState<'pie' | 'bar' | 'line'>('pie');

  const currency = CURRENCIES.find(c => c.code === state.preferences.currency) || CURRENCIES[0];

  const periods = [
    { key: 'week' as const, label: 'Week' },
    { key: 'month' as const, label: 'Month' },
    { key: '3months' as const, label: '3 Months' },
    { key: 'year' as const, label: 'Year' },
  ];

  const chartTypes = [
    { key: 'pie' as const, label: 'Categories', icon: PieChartIcon },
    { key: 'bar' as const, label: 'Monthly', icon: BarChart3 },
    { key: 'line' as const, label: 'Trend', icon: TrendingUp },
  ];

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return state.transactions.filter(
      transaction => new Date(transaction.date) >= startDate
    );
  }, [state.transactions, selectedPeriod]);

  const categoryData = useMemo(() => {
    const expensesByCategory: { [key: string]: number } = {};
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        expensesByCategory[transaction.category] = 
          (expensesByCategory[transaction.category] || 0) + transaction.amount;
      });

    return Object.entries(expensesByCategory)
      .map(([categoryId, amount]) => {
        const category = DEFAULT_CATEGORIES.find(c => c.id === categoryId);
        return {
          name: category?.name || 'Unknown',
          amount,
          color: category?.color || theme.colors.textSecondary,
          legendFontColor: theme.colors.text,
          legendFontSize: 12,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [filteredTransactions, theme]);

  const monthlyData = useMemo(() => {
    const monthlyTotals: { [key: string]: { income: number; expense: number } } = {};
    
    filteredTransactions.forEach(transaction => {
      const monthKey = new Date(transaction.date).toLocaleDateString('en-US', { 
        month: 'short', 
        year: '2-digit' 
      });
      
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = { income: 0, expense: 0 };
      }
      
      monthlyTotals[monthKey][transaction.type] += transaction.amount;
    });

    const labels = Object.keys(monthlyTotals).slice(-6);
    const incomeData = labels.map(month => monthlyTotals[month]?.income || 0);
    const expenseData = labels.map(month => monthlyTotals[month]?.expense || 0);

    return {
      labels,
      datasets: [
        {
          data: incomeData,
          color: () => theme.colors.income,
          strokeWidth: 2,
        },
        {
          data: expenseData,
          color: () => theme.colors.expense,
          strokeWidth: 2,
        },
      ],
    };
  }, [filteredTransactions, theme]);

  const trendData = useMemo(() => {
    const dailyBalance: { [key: string]: number } = {};
    let runningBalance = 0;
    
    const sortedTransactions = [...filteredTransactions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedTransactions.forEach(transaction => {
      const dateKey = transaction.date.toString().split('T')[0];
      const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      runningBalance += amount;
      dailyBalance[dateKey] = runningBalance;
    });

    const labels = Object.keys(dailyBalance).slice(-7);
    const data = labels.map(date => dailyBalance[date]);

    return {
      labels: labels.map(date => new Date(date).toLocaleDateString('en-US', { day: 'numeric' })),
      datasets: [{
        data: data.length > 0 ? data : [0],
        color: () => theme.colors.primary,
        strokeWidth: 3,
      }],
    };
  }, [filteredTransactions, theme]);

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.colors.text + Math.floor(opacity * 255).toString(16),
    labelColor: (opacity = 1) => theme.colors.text + Math.floor(opacity * 255).toString(16),
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 12,
    },
  };

  const renderChart = () => {
    switch (activeChart) {
      case 'pie':
        if (categoryData.length === 0) {
          return (
            <View style={[styles.emptyChart, { backgroundColor: theme.colors.card }]}>
              <PieChartIcon size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyChartText, { color: theme.colors.text }]}>
                No expense data available
              </Text>
            </View>
          );
        }
        return (
          <PieChart
            data={categoryData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
            absolute
          />
        );

      case 'bar':
        if (monthlyData.labels.length === 0) {
          return (
            <View style={[styles.emptyChart, { backgroundColor: theme.colors.card }]}>
              <BarChart3 size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyChartText, { color: theme.colors.text }]}>
                No monthly data available
              </Text>
            </View>
          );
        }
        return (
          <BarChart
            data={monthlyData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            yAxisLabel={currency.symbol}
            showBarTops={false}
            fromZero
          />
        );

      case 'line':
        if (trendData.labels.length === 0) {
          return (
            <View style={[styles.emptyChart, { backgroundColor: theme.colors.card }]}>
              <TrendingUp size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyChartText, { color: theme.colors.text }]}>
                No trend data available
              </Text>
            </View>
          );
        }
        return (
          <LineChart
            data={trendData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            yAxisLabel={currency.symbol}
            yAxisSuffix=""
            withDots={true}
            withShadow={false}
            withInnerLines={false}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Analytics
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Financial insights and trends
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.summaryIcon, { backgroundColor: theme.colors.income + '20' }]}>
              <TrendingUp size={24} color={theme.colors.income} />
            </View>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Income
            </Text>
            <Text style={[styles.summaryAmount, { color: theme.colors.income }]}>
              {currency.symbol}{totalIncome.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.summaryIcon, { backgroundColor: theme.colors.expense + '20' }]}>
              <TrendingDown size={24} color={theme.colors.expense} />
            </View>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Expenses
            </Text>
            <Text style={[styles.summaryAmount, { color: theme.colors.expense }]}>
              {currency.symbol}{totalExpenses.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.summaryIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <DollarSign size={24} color={theme.colors.primary} />
            </View>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
              Balance
            </Text>
            <Text style={[
              styles.summaryAmount,
              { color: balance >= 0 ? theme.colors.income : theme.colors.expense }
            ]}>
              {currency.symbol}{Math.abs(balance).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Time Period Selector */}
        <View style={styles.periodContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Time Period
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.periodButtons}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.key}
                  style={[
                    styles.periodButton,
                    {
                      backgroundColor: selectedPeriod === period.key
                        ? theme.colors.primary
                        : theme.colors.card,
                    }
                  ]}
                  onPress={() => setSelectedPeriod(period.key)}
                >
                  <Text style={[
                    styles.periodButtonText,
                    {
                      color: selectedPeriod === period.key
                        ? '#FFFFFF'
                        : theme.colors.text,
                    }
                  ]}>
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Chart Type Selector */}
        <View style={styles.chartTypeContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Chart Type
          </Text>
          <View style={styles.chartTypeButtons}>
            {chartTypes.map((chart) => {
              const IconComponent = chart.icon;
              return (
                <TouchableOpacity
                  key={chart.key}
                  style={[
                    styles.chartTypeButton,
                    {
                      backgroundColor: activeChart === chart.key
                        ? theme.colors.primary + '20'
                        : theme.colors.card,
                      borderColor: activeChart === chart.key
                        ? theme.colors.primary
                        : theme.colors.border,
                    }
                  ]}
                  onPress={() => setActiveChart(chart.key)}
                >
                  <IconComponent 
                    size={20} 
                    color={activeChart === chart.key ? theme.colors.primary : theme.colors.textSecondary} 
                  />
                  <Text style={[
                    styles.chartTypeText,
                    {
                      color: activeChart === chart.key
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
                    }
                  ]}>
                    {chart.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Chart */}
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
          {renderChart()}
        </View>

        {/* Top Categories */}
        {categoryData.length > 0 && (
          <View style={styles.topCategoriesContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Top Spending Categories
            </Text>
            <View style={[styles.categoriesList, { backgroundColor: theme.colors.card }]}>
              {categoryData.slice(0, 5).map((category, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryLeft}>
                    <View
                      style={[
                        styles.categoryIndicator,
                        { backgroundColor: category.color }
                      ]}
                    />
                    <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                      {category.name}
                    </Text>
                  </View>
                  <Text style={[styles.categoryAmount, { color: theme.colors.text }]}>
                    {currency.symbol}{category.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  periodContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartTypeContainer: {
    marginBottom: 24,
  },
  chartTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  chartTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  chartTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: {
    borderRadius: 16,
    marginBottom: 24,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyChartText: {
    fontSize: 16,
    marginTop: 12,
  },
  topCategoriesContainer: {
    marginBottom: 24,
  },
  categoriesList: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});