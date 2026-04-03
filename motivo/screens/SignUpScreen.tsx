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
import logo from '../assets/logo.png';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isValidName, setIsValidName] = useState(true);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isValidUsername, setIsValidUsername] = useState(true);
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(true);

  const _missingFields = () => {
    let missing = false;

    if (!fullName) {
      setIsValidName(false);
      missing = true;
    }

    if (!email) {
      setIsValidEmail(false);
      missing = true;
    }

    if (!username) {
      setIsValidUsername(false);
      missing = true;
    }

    if (!password) {
      setIsValidPassword(false);
      missing = true;
    }

    if (!confirmPassword) {
      setDoPasswordsMatch(false);
      missing = true;
    }

    return missing;
  };

  const _validName = (name: string) => {
    const isValid = /^[A-Z][a-z]+( [A-Z][a-z]+)+$/.test(name);
    return isValid && name.length >= 5 && name.length <= 50;
  };

  const _validEmail = (email: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return isValid && email.length <= 100;
  };

  const _validUsername = (uname: string) => {
    const isValid = /^[a-zA-Z0-9]+$/.test(uname);
    return isValid && uname.length >= 3 && uname.length <= 50;
  };

  const _validPassword = (pwd: string) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    return pwd.length >= 8 && hasUpperCase && hasLowerCase && hasNumber;
  };

  const _usernameExists = async (username: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = "No rows found", which is fine
      console.error('Error checking username:', error.message);
      return true;
    }

    return !!data;
  };

  const _trimInputs = () => {
    setFullName(fullName.trim());
    setEmail(email.trim());
    setUsername(username.trim());
    setPassword(password.trim());
    setConfirmPassword(confirmPassword.trim());
  };

  const handleSignUp = async () => {
    _trimInputs();
    if (_missingFields()) {
      setError('Please fill in all fields');
      return;
    }

    if (!_validName(fullName)) {
      setIsValidName(false);
      setError(
        'Full name must be at least 5-50 characters long, contain only letters and spaces and start with a capital letter',
      );
      return;
    }

    if (!_validEmail(email)) {
      setIsValidEmail(false);
      setError('Please enter a valid email address');
      return;
    }

    if (!_validUsername(username)) {
      setIsValidUsername(false);
      setError('Username must be 3-50 characters long and can only contain letters and numbers');
      return;
    }

    if (!_validPassword(password)) {
      setIsValidPassword(false);
      setError(
        'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter and a number',
      );
      return;
    }

    if (password !== confirmPassword) {
      setIsValidPassword(false);
      setDoPasswordsMatch(false);
      setError('Passwords do not match');
      return;
    }

    if (await _usernameExists(username)) {
      setIsValidUsername(false);
      setError('Username is already taken');
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(`Supabase error: ${error.message}`);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        username: username.toLowerCase(),
      });

      if (profileError) {
        setError(`Profile error: ${profileError.message}`);
        return;
      }
    }

    // Auth state listener in RootNavigator will switch to the Main tabs when a session is established.
  };

  const _resetErrorStates = () => {
    setIsValidName(true);
    setIsValidUsername(true);
    setIsValidPassword(true);
    setDoPasswordsMatch(true);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Create Account</Text>
          <TextInput
            style={isValidName ? styles.input : styles.inputError}
            placeholder="Full Name"
            placeholderTextColor="#52606D"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              setError('');
              _resetErrorStates();
            }}
          />
          <TextInput
            style={isValidEmail ? styles.input : styles.inputError}
            placeholder="Email"
            placeholderTextColor="#52606D"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
              _resetErrorStates();
            }}
          />
          <TextInput
            style={isValidUsername ? styles.input : styles.inputError}
            placeholder="Username"
            placeholderTextColor="#52606D"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setError('');
              _resetErrorStates();
            }}
          />
          <TextInput
            style={isValidPassword ? styles.input : styles.inputError}
            placeholder="Password"
            placeholderTextColor="#52606D"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
              _resetErrorStates();
            }}
          />
          <TextInput
            style={doPasswordsMatch ? styles.input : styles.inputError}
            placeholder="Confirm Password"
            placeholderTextColor="#52606D"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setError('');
              _resetErrorStates();
            }}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button text="Sign Up" onPress={handleSignUp} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.text, { marginTop: 20 }]}>
              Back to
              <Text style={styles.link}> Login</Text>
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
  inputError: {
    backgroundColor: Colors.softAccent,
    borderColor: Colors.errorRed,
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
    color: Colors.errorRed,
    marginBottom: 10,
    textAlign: 'center',
  },
});
