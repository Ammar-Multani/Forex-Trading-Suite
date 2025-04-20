import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { ExpoRoot } from 'expo-router';
import { ExchangeRateProvider } from './contexts/ExchangeRateContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Theme-aware app component
function ThemedApp() {
  const { theme, isDark } = useTheme();
  
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <ExchangeRateProvider>
          <StatusBar style={isDark ? "light" : "dark"} />
          <ExpoRoot context={require.context('./app')} />
        </ExchangeRateProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

// Must be exported or Fast Refresh won't update the context
export function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;
