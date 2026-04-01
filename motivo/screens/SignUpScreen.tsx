import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

import { supabase } from '../lib/supabase';
import { Colors } from '../constants/colors';
import Button from '../components/Button';
import logo from '../assets/logo.png';

type Props = { goToLogin: () => void };

export default function SignUpScreen({ goToLogin }: Props) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({ email: username, password });
    if (error) setError(error.message);
    else console.log('Signed up', data);
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#52606D"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#52606D"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#52606D"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#52606D"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button text="Sign Up" onPress={handleSignUp} />

      <TouchableOpacity onPress={goToLogin}>
        <Text style={[styles.text, { marginTop: 20 }]}>
          Back to
          <Text style={styles.link}> Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
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
    marginTop: -50,
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
