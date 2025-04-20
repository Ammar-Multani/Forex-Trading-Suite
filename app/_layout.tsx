import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout() {
  const { isDark } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#121212' : '#f6f6f6',
        },
        headerTintColor: isDark ? '#fff' : '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: isDark ? '#121212' : '#f6f6f6',
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
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="appearance"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="disclaimer"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="manual"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="report-bug"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="exchange-rates"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
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
