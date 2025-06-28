import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  Plus, 
  Minus, 
  Calendar, 
  FileText, 
  Check,
  ArrowLeft,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useApp } from '@/context/AppContext';
import { DEFAULT_CATEGORIES } from '@/constants/categories';

export default function CreateScreen() {
  const theme = useTheme();
  const { addTransaction } = useApp();
  
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const availableCategories = DEFAULT_CATEGORIES.filter(
    category => category.type === type || category.type === 'both'
  );

  const handleSave = async () => {
    if (!amount || !title || !selectedCategory) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsLoading(true);

    try {
      addTransaction({
        amount: numAmount,
        title: title.trim(),
        type,
        category: selectedCategory,
        date,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setAmount('');
      setTitle('');
      setSelectedCategory('');
      setDate(new Date());
      setNotes('');

      Alert.alert(
        'Success',
        'Transaction added successfully!',
        [
          {
            text: 'Add Another',
            style: 'default',
          },
          {
            text: 'Go to Home',
            style: 'default',
            onPress: () => router.push('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Add Transaction
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Type Toggle */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Transaction Type
            </Text>
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: type === 'expense'
                      ? theme.colors.expense
                      : theme.colors.card,
                  }
                ]}
                onPress={() => {
                  setType('expense');
                  setSelectedCategory('');
                }}
              >
                <Minus size={20} color={type === 'expense' ? '#FFFFFF' : theme.colors.expense} />
                <Text style={[
                  styles.typeButtonText,
                  { color: type === 'expense' ? '#FFFFFF' : theme.colors.expense }
                ]}>
                  Expense
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: type === 'income'
                      ? theme.colors.income
                      : theme.colors.card,
                  }
                ]}
                onPress={() => {
                  setType('income');
                  setSelectedCategory('');
                }}
              >
                <Plus size={20} color={type === 'income' ? '#FFFFFF' : theme.colors.income} />
                <Text style={[
                  styles.typeButtonText,
                  { color: type === 'income' ? '#FFFFFF' : theme.colors.income }
                ]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Amount *
            </Text>
            <View style={[styles.amountInput, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.currencySymbol, { color: theme.colors.textSecondary }]}>
                $
              </Text>
              <TextInput
                style={[styles.amountText, { color: theme.colors.text }]}
                placeholder="0.00"
                placeholderTextColor={theme.colors.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Title *
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }
              ]}
              placeholder="Enter transaction title"
              placeholderTextColor={theme.colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Category *
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {availableCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: selectedCategory === category.id
                        ? category.color + '20'
                        : theme.colors.card,
                      borderColor: selectedCategory === category.id
                        ? category.color
                        : theme.colors.border,
                    }
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>
                    {category.type === 'income' ? '💰' : '💸'}
                  </Text>
                  <Text style={[
                    styles.categoryName,
                    {
                      color: selectedCategory === category.id
                        ? category.color
                        : theme.colors.text,
                    }
                  ]}>
                    {category.name}
                  </Text>
                  {selectedCategory === category.id && (
                    <View style={[styles.selectedIndicator, { backgroundColor: category.color }]}>
                      <Check size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Date
            </Text>
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color={theme.colors.primary} />
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Notes Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Notes (Optional)
            </Text>
            <View style={[styles.notesContainer, { backgroundColor: theme.colors.card }]}>
              <FileText size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.notesInput, { color: theme.colors.text }]}
                placeholder="Add notes about this transaction"
                placeholderTextColor={theme.colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: isLoading ? 0.7 : 1,
              }
            ]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Adding...' : 'Add Transaction'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountText: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  categoriesScroll: {
    paddingRight: 24,
  },
  categoryItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    minWidth: 80,
    position: 'relative',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  notesInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});