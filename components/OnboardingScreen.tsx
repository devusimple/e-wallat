import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Wallet, PieChart, Shield, Check } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useApp } from '@/context/AppContext';
import { CURRENCIES } from '@/constants/categories';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Welcome to E-Wallet',
    subtitle: 'Track your expenses and income with ease. Works completely offline.',
    icon: <Wallet size={80} color="#FFFFFF" />,
    color: '#3B82F6',
  },
  {
    id: 2,
    title: 'Visual Analytics',
    subtitle: 'Get insights into your spending habits with beautiful charts and reports.',
    icon: <PieChart size={80} color="#FFFFFF" />,
    color: '#10B981',
  },
  {
    id: 3,
    title: 'Secure & Private',
    subtitle: 'Your data stays on your device. Optional biometric security available.',
    icon: <Shield size={80} color="#FFFFFF" />,
    color: '#8B5CF6',
  },
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const { dispatch } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [setupStep, setSetupStep] = useState(0);
  const [initialBudget, setInitialBudget] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('system');

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setSetupStep(1);
    }
  };

  const handleSetupComplete = () => {
    dispatch({
      type: 'SET_PREFERENCES',
      payload: {
        currency: selectedCurrency,
        theme: selectedTheme,
        biometricEnabled: false,
        pinEnabled: false,
        notificationsEnabled: true,
        budgetAlerts: true,
      },
    });
    dispatch({ type: 'SET_ONBOARDED', payload: true });
  };

  if (setupStep === 0) {
    const slide = slides[currentSlide];
    
    return (
      <LinearGradient
        colors={[slide.color, slide.color + 'DD']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.slideContainer}>
            <View style={styles.iconContainer}>
              {slide.icon}
            </View>
            
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.pagination}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentSlide && styles.activeDot,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <ChevronRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={[styles.setupContainer, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.setupScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.setupHeader}>
          <Text style={[styles.setupTitle, { color: theme.colors.text }]}>
            Setup Your Wallet
          </Text>
          <Text style={[styles.setupSubtitle, { color: theme.colors.textSecondary }]}>
            Let's personalize your experience
          </Text>
        </View>

        <View style={[styles.setupCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Initial Budget (Optional)
          </Text>
          <TextInput
            style={[
              styles.budgetInput,
              { 
                borderColor: theme.colors.border,
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
              }
            ]}
            placeholder="Enter your monthly budget"
            placeholderTextColor={theme.colors.textSecondary}
            value={initialBudget}
            onChangeText={setInitialBudget}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.setupCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Currency
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.currencyContainer}>
              {CURRENCIES.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyOption,
                    {
                      borderColor: selectedCurrency === currency.code 
                        ? theme.colors.primary 
                        : theme.colors.border,
                      backgroundColor: selectedCurrency === currency.code
                        ? theme.colors.primary + '20'
                        : theme.colors.surface,
                    }
                  ]}
                  onPress={() => setSelectedCurrency(currency.code)}
                >
                  <Text style={[
                    styles.currencySymbol,
                    { 
                      color: selectedCurrency === currency.code 
                        ? theme.colors.primary 
                        : theme.colors.text 
                    }
                  ]}>
                    {currency.symbol}
                  </Text>
                  <Text style={[
                    styles.currencyCode,
                    { 
                      color: selectedCurrency === currency.code 
                        ? theme.colors.primary 
                        : theme.colors.textSecondary 
                    }
                  ]}>
                    {currency.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={[styles.setupCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Theme Preference
          </Text>
          <View style={styles.themeContainer}>
            {[
              { key: 'light' as const, label: 'Light' },
              { key: 'dark' as const, label: 'Dark' },
              { key: 'system' as const, label: 'System' },
            ].map((theme) => (
              <TouchableOpacity
                key={theme.key}
                style={[
                  styles.themeOption,
                  {
                    borderColor: selectedTheme === theme.key 
                      ? '#3B82F6' 
                      : '#E5E7EB',
                    backgroundColor: selectedTheme === theme.key
                      ? '#3B82F6' + '20'
                      : '#FFFFFF',
                  }
                ]}
                onPress={() => setSelectedTheme(theme.key)}
              >
                {selectedTheme === theme.key && (
                  <Check size={16} color="#3B82F6" />
                )}
                <Text style={[
                  styles.themeLabel,
                  { 
                    color: selectedTheme === theme.key ? '#3B82F6' : '#374151',
                    marginLeft: selectedTheme === theme.key ? 8 : 0,
                  }
                ]}>
                  {theme.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.completeButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSetupComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.completeButtonText}>Complete Setup</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bottomSection: {
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignSelf: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  setupContainer: {
    flex: 1,
  },
  setupScroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  setupHeader: {
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  setupSubtitle: {
    fontSize: 16,
  },
  setupCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  budgetInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  currencyContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  currencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 12,
    fontWeight: '500',
  },
  themeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  completeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});