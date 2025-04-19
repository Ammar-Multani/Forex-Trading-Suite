import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DisclaimerScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Disclaimer</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Disclaimer</Text>
        
        <Text style={styles.paragraph}>
          The Forex Calculator Suite is designed to provide tools for forex trading calculations. However, please note the following:
        </Text>
        
        <Text style={styles.bulletPoint}>• The calculations provided are estimates only.</Text>
        <Text style={styles.bulletPoint}>• This application does not provide financial advice.</Text>
        <Text style={styles.bulletPoint}>• Trading forex involves substantial risk of loss.</Text>
        <Text style={styles.bulletPoint}>• Past performance is not indicative of future results.</Text>
        <Text style={styles.bulletPoint}>• You should consult with a licensed financial advisor before making any trading decisions.</Text>
        
        <Text style={styles.paragraph}>
          By using this application, you acknowledge that you understand these risks and that you are solely responsible for your trading decisions.
        </Text>
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  paragraph: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    marginBottom: 8,
    marginLeft: 16,
  },
});