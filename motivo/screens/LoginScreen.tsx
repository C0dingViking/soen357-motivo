import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { supabase } from '../lib/supabase';
import { Colors } from '../constants/colors';
import Button from '../components/Button';
import type { RootStackParamList } from '../navigation/types';
import logo from '../assets/logo_with_name.png';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both your email and password');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(`Supabase error: ${error.message}`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Login</Text>
          <TextInput
            style={error ? styles.inputError : styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.textMedium}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
          />
          <TextInput
            style={error ? styles.inputError : styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.textMedium}
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button text="Login" onPress={handleLogin} />

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={[styles.text, { marginTop: 20 }]}>
              Create an
              <Text style={styles.link}> account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.strongAccent,
    marginBottom: 40,
    textAlign: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 50,
    marginTop: -100,
  },
  input: {
    backgroundColor: Colors.softAccent,
    borderColor: Colors.strongAccent,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    color: Colors.textDark,
  },
  inputError: {
    backgroundColor: Colors.softAccent,
    borderColor: Colors.errorRed,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    color: Colors.textDark,
  },
  text: {
    color: Colors.textMedium,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  link: {
    color: Colors.strongAccent,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
