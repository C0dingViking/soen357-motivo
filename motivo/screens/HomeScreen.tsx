import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';

import { supabase } from '../lib/supabase';
import { Colors } from '../constants/colors';

export default function HomeScreen() {
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user.id;

      if (!userId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setFullName(data.full_name);
      }
    };

    fetchProfile();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome{fullName ? `, ${fullName}` : 'John Doe'}</Text>

      <Text style={styles.subtitle}>This is your home page</Text>
      <Text style={styles.subtitle}>🚧 More features coming soon 🚧</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.strongAccent,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMedium,
    textAlign: 'center',
  },
});
