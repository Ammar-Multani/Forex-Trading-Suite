import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';

export default function App() {
  // Load any resources or data needed for the app
  const [fontsLoaded, fontError] = useFonts({
    'SpaceMono-Regular': require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Prevent the splash screen from auto-hiding before asset loading is complete
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // If the fonts haven't loaded and there's no error, return null
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Expo Router uses the root component as a wrapper for all screens
  return (
    <>
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});