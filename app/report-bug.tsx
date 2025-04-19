import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ReportBugScreen() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert('Please provide a description of the bug');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Thank you for your report! We will investigate the issue.');
      router.back();
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report a Bug</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Report a Bug</Text>
        <Text style={styles.description}>
          Please provide details about the issue you encountered. This will help us fix it as quickly as possible.
        </Text>
        
        <TextInput
          label="Bug Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          style={styles.input}
          mode="outlined"
          outlineColor="#444"
          activeOutlineColor="#6200ee"
          textColor="#fff"
          theme={{ colors: { background: '#2A2A2A' } }}
        />
        
        <TextInput
          label="Your Email (optional)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
          mode="outlined"
          outlineColor="#444"
          activeOutlineColor="#6200ee"
          textColor="#fff"
          theme={{ colors: { background: '#2A2A2A' } }}
        />
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
        >
          Submit Report
        </Button>
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
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#2A2A2A',
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: '#6200ee',
  },
});