import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const handleShare = async () => {
    try {
      await Linking.openURL('https://expo.dev');
    } catch (error) {
      console.error('Could not open share dialog', error);
    }
  };

  const handleRateUs = async () => {
    try {
      await Linking.openURL('https://expo.dev');
    } catch (error) {
      console.error('Could not open rate dialog', error);
    }
  };

  const handleEraseContent = async () => {
    try {
      const themeMode = await AsyncStorage.getItem('themeMode');
      await AsyncStorage.clear();
      if (themeMode) {
        await AsyncStorage.setItem('themeMode', themeMode);
      }
      alert('All content has been erased successfully');
    } catch (error) {
      console.error('Error erasing content', error);
    }
  };

  const renderSettingItem = (
    icon: string, 
    title: string, 
    onPress: () => void, 
    color: string = isDark ? '#fff' : '#000',
    showChevron: boolean = true
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon as any} size={24} color={color} style={styles.settingIcon} />
        <Text variant="bodyLarge" style={{ color }}>{title}</Text>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={20} color={isDark ? '#666' : '#999'} />}
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <Text variant="bodySmall" style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f6f6f6' }]} edges={['bottom']}>
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text variant="titleLarge">SETTINGS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {renderSectionHeader('APPEARANCE')}
        <View style={[styles.settingSection, { backgroundColor: isDark ? '#1E1E1E' : '#fff' }]}>
          {renderSettingItem('color-palette-outline', 'Appearance', () => handleNavigation('/appearance'))}
        </View>

        {renderSectionHeader('LEGAL')}
        <View style={[styles.settingSection, { backgroundColor: isDark ? '#1E1E1E' : '#fff' }]}>
          {renderSettingItem('document-text-outline', 'Terms of service', () => handleNavigation('/terms'))}
          <Divider style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
          {renderSettingItem('information-circle-outline', 'Disclaimer', () => handleNavigation('/disclaimer'))}
        </View>

        {renderSectionHeader('PRIVACY')}
        <View style={[styles.settingSection, { backgroundColor: isDark ? '#1E1E1E' : '#fff' }]}>
          {renderSettingItem('shield-outline', 'Privacy policy', () => handleNavigation('/privacy'))}
        </View>

        {renderSectionHeader('FOREX CALCULATOR SUITE')}
        <View style={[styles.settingSection, { backgroundColor: isDark ? '#1E1E1E' : '#fff' }]}>
          {renderSettingItem('trending-up-outline', 'Exchange Rates', () => handleNavigation('/exchange-rates'))}
          <Divider style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
          {renderSettingItem('book-outline', 'Manual', () => handleNavigation('/manual'))}
          <Divider style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
          {renderSettingItem('share-social-outline', 'Share this app', handleShare)}
          <Divider style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
          {renderSettingItem('thumbs-up-outline', 'Rate us', handleRateUs)}
        </View>

        {renderSectionHeader('CUSTOMER SERVICE')}
        <View style={[styles.settingSection, { backgroundColor: isDark ? '#1E1E1E' : '#fff' }]}>
          {renderSettingItem('bug-outline', 'Report a bug', () => handleNavigation('/report-bug'))}
        </View>

        <View style={[styles.settingSection, { backgroundColor: isDark ? '#1E1E1E' : '#fff' }]}>
          {renderSettingItem('trash-outline', 'Erase All Content', handleEraseContent, '#FF3B30')}
        </View>

        <View style={styles.versionContainer}>
          <Text variant="bodySmall" style={{ color: isDark ? '#666' : '#999' }}>Version 1.0.0</Text>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 12,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 16,
  },
  settingSection: {
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginLeft: 56,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    fontSize: 14,
  },
});
