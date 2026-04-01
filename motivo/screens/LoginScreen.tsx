import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

import { supabase } from '../lib/supabase';
import { Colors } from '../constants/colors';
import Button from '../components/Button';
import logo from '../assets/logo.png';

type Props = { goToSignUp: () => void };

export default function LoginScreen({ goToSignUp }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });
    if (error) setError(error.message);
    else console.log('Logged in', data);
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={Colors.textMedium}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={Colors.textMedium}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button text="Login" onPress={() => console.log('Login pressed')} />

      <TouchableOpacity onPress={goToSignUp}>
        <Text style={[styles.text, { marginTop: 20 }]}>
          Create an
          <Text style={styles.link}> account</Text>
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
