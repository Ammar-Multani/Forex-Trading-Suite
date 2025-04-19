import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#121212',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: '#121212',
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="calculators/[id]"
            options={({ route }) => ({
              title: getCalculatorTitle(route.params?.id),
              headerBackTitle: 'Back',
            })}
          />
        </Stack>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

// Helper function to get calculator title based on ID
function getCalculatorTitle(id: string | string[] | undefined): string {
  if (!id || Array.isArray(id)) return 'Calculator';
  
  const titles: Record<string, string> = {
    'compounding': 'Compounding Calculator',
    'fibonacci': 'Fibonacci Calculator',
    'pip-difference': 'Pip Difference Calculator',
    'pip-value': 'Pip Calculator',
    'pivot-points': 'Pivot Points Calculator',
    'position-size': 'Position Size Calculator',
    'profit-loss': 'Profit/Loss Calculator',
    'margin': 'Margin Calculator',
    'stop-loss': 'Stop Loss/Take Profit Calculator',
  };
  
  return titles[id] || 'Calculator';
}