import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

import { Colors } from '../constants/colors';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';

export default function SettingsScreen() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    if (isSigningOut) return;

    setError(null);
    setIsSigningOut(true);
    const { error } = await supabase.auth.signOut();
    setIsSigningOut(false);

    if (error) {
      setError(error.message);
      Alert.alert('Logout failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Settings coming soon</Text>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Button text={isSigningOut ? 'Logging out…' : 'Log out'} onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMedium,
  },
  error: {
    color: Colors.errorRed,
    marginTop: 12,
    textAlign: 'center',
  },
});
