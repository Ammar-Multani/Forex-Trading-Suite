import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// Calculator cards data
const calculators = [
  {
    id: 'compounding',
    name: 'Compounding Calculator',
    icon: 'trending-up',
    description: 'Calculate compound growth over time',
    color: ['#4158D0', '#C850C0'],
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci Calculator',
    icon: 'git-network',
    description: 'Calculate Fibonacci retracement levels',
    color: ['#0093E9', '#80D0C7'],
  },
  {
    id: 'pip-difference',
    name: 'Pip Difference Calculator',
    icon: 'swap-horizontal',
    description: 'Calculate pip difference between prices',
    color: ['#8EC5FC', '#E0C3FC'],
  },
  {
    id: 'pip-value',
    name: 'Pip Calculator',
    icon: 'calculator',
    description: 'Calculate pip value in account currency',
    color: ['#FF9A8B', '#FF6A88'],
  },
  {
    id: 'pivot-points',
    name: 'Pivot Points Calculator',
    icon: 'analytics',
    description: 'Calculate pivot points using various methods',
    color: ['#A9C9FF', '#FFBBEC'],
  },
  {
    id: 'position-size',
    name: 'Position Size Calculator',
    icon: 'resize',
    description: 'Calculate optimal position size based on risk',
    color: ['#21D4FD', '#B721FF'],
  },
  {
    id: 'profit-loss',
    name: 'Profit/Loss Calculator',
    icon: 'stats-chart',
    description: 'Calculate potential profit or loss',
    color: ['#FA8BFF', '#2BD2FF'],
  },
  {
    id: 'margin',
    name: 'Margin Calculator',
    icon: 'wallet',
    description: 'Calculate required margin for positions',
    color: ['#08AEEA', '#2AF598'],
  },
  {
    id: 'stop-loss',
    name: 'Stop Loss/Take Profit Calculator',
    icon: 'options',
    description: 'Calculate stop loss and take profit levels',
    color: ['#FEE140', '#FA709A'],
  },
];

export default function Home() {
  const router = useRouter();

  const navigateToCalculator = (id: string) => {
    router.push(`/calculators/${id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Forex Calculator Suite</Text>
        <Text style={styles.subtitle}>Professional trading tools</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calculatorsGrid}>
          {calculators.map((calculator) => (
            <TouchableOpacity
              key={calculator.id}
              style={styles.calculatorCard}
              onPress={() => navigateToCalculator(calculator.id)}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} style={styles.cardBlur}>
                <LinearGradient
                  colors={calculator.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name={calculator.icon} size={28} color="#fff" />
                  </View>
                  <Text style={styles.calculatorName}>{calculator.name}</Text>
                  <Text style={styles.calculatorDescription}>{calculator.description}</Text>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  calculatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calculatorCard: {
    width: '48%',
    height: 180,
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardBlur: {
    flex: 1,
  },
  cardGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  calculatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  calculatorDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});