import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, RadioButton, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function AppearanceScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f6f6f6' }]} edges={['bottom']}>
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text variant="titleLarge">Appearance</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>Theme</Text>
        <View style={[styles.settingSection, { backgroundColor: isDark ? '#1E1E1E' : '#fff' }]}>
          <RadioButton.Group onValueChange={(value) => setThemeMode(value as 'light' | 'dark' | 'system')} value={themeMode}>
            <View style={styles.radioItem}>
              <RadioButton value="light" color="#6200ee" />
              <Text variant="bodyLarge">Light</Text>
            </View>
            
            <Divider style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
            
            <View style={styles.radioItem}>
              <RadioButton value="dark" color="#6200ee" />
              <Text variant="bodyLarge">Dark</Text>
            </View>
            
            <Divider style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
            
            <View style={styles.radioItem}>
              <RadioButton value="system" color="#6200ee" />
              <Text variant="bodyLarge">System Default</Text>
            </View>
          </RadioButton.Group>
        </View>
        
        <Text variant="bodySmall" style={styles.note}>
          System Default will automatically switch between light and dark themes based on your device settings.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  settingSection: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  divider: {
    height: 1,
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
