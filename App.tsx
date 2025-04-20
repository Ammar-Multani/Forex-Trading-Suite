import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { darkTheme } from './utils/theme';
import { ExpoRoot } from 'expo-router';
import { ExchangeRateProvider } from './contexts/ExchangeRateContext';

// Must be exported or Fast Refresh won't update the context
export function App() {
  return (
    <PaperProvider theme={darkTheme}>
      <SafeAreaProvider>
        <ExchangeRateProvider>
          <StatusBar style="light" />
          <ExpoRoot context={require.context('./app')} />
        </ExchangeRateProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

export default App;
