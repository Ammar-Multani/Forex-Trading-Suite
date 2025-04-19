import { useEffect } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { darkTheme } from './utils/theme';
import 'expo-router/entry';

export default function App() {
  return (
    <PaperProvider theme={darkTheme}>
      <SafeAreaProvider>
        <Redirect href="/" />
      </SafeAreaProvider>
    </PaperProvider>
  );
}