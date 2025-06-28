import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useApp } from '@/context/AppContext';
import OnboardingScreen from '@/components/OnboardingScreen';

export default function IndexScreen() {
  const { state } = useApp();

  useEffect(() => {
    if (state.isOnboarded) {
      router.replace('/(tabs)');
    }
  }, [state.isOnboarded]);

  if (state.isOnboarded) {
    return <View style={styles.container} />;
  }

  return <OnboardingScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
  },
});