import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();

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
      await AsyncStorage.clear();
      alert('All content has been erased successfully');
    } catch (error) {
      console.error('Error erasing content', error);
    }
  };

  const renderSettingItem = (
    icon: string, 
    title: string, 
    onPress: () => void, 
    color: string = '#fff',
    showChevron: boolean = true
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon as any} size={24} color={color} style={styles.settingIcon} />
        <Text style={[styles.settingText, { color }]}>{title}</Text>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={20} color="#666" />}
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {renderSectionHeader('APPEARANCE')}
        <View style={styles.settingSection}>
          {renderSettingItem('color-palette-outline', 'Appearance', () => handleNavigation('/appearance'))}
        </View>

        {renderSectionHeader('LEGAL')}
        <View style={styles.settingSection}>
          {renderSettingItem('document-text-outline', 'Terms of service', () => handleNavigation('/terms'))}
          <Divider style={styles.divider} />
          {renderSettingItem('information-circle-outline', 'Disclaimer', () => handleNavigation('/disclaimer'))}
        </View>

        {renderSectionHeader('PRIVACY')}
        <View style={styles.settingSection}>
          {renderSettingItem('shield-outline', 'Privacy policy', () => handleNavigation('/privacy'))}
        </View>

        {renderSectionHeader('FOREX CALCULATOR SUITE')}
        <View style={styles.settingSection}>
          {renderSettingItem('trending-up-outline', 'Exchange Rates', () => handleNavigation('/exchange-rates'))}
          <Divider style={styles.divider} />
          {renderSettingItem('book-outline', 'Manual', () => handleNavigation('/manual'))}
          <Divider style={styles.divider} />
          {renderSettingItem('share-social-outline', 'Share this app', handleShare)}
          <Divider style={styles.divider} />
          {renderSettingItem('thumbs-up-outline', 'Rate us', handleRateUs)}
        </View>

        {renderSectionHeader('CUSTOMER SERVICE')}
        <View style={styles.settingSection}>
          {renderSettingItem('bug-outline', 'Report a bug', () => handleNavigation('/report-bug'))}
        </View>

        <View style={styles.settingSection}>
          {renderSettingItem('trash-outline', 'Erase All Content', handleEraseContent, '#FF3B30')}
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 12,
    color: '#888',
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 16,
  },
  settingSection: {
    backgroundColor: '#1E1E1E',
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
    color: '#fff',
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 1,
    marginLeft: 56,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
  },
});
