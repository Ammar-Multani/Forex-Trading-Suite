import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { darkTheme } from './utils/theme';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// Must be exported or Fast Refresh won't update the context
export function App() {
  return (
    <PaperProvider theme={darkTheme}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <ExpoRoot context={require.context('./app')} />
      </SafeAreaProvider>
    </PaperProvider>
  );
}

export default registerRootComponent(App);