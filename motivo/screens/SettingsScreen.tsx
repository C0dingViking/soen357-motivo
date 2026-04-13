import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Pressable, ScrollView } from 'react-native';

import { Colors } from '../constants/colors';
import { supabase } from '../lib/supabase';
import { showInAppNotification } from '../utils/notificationService';

export default function SettingsScreen() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileName, setProfileName] = useState('name');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (data?.full_name) {
        setProfileName(data.full_name.split(' ')[0]);
      }
    };

    loadProfile();
  }, []);

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

  const handleToggleNotifications = () => {
    setError(null);
    const nextValue = !notificationsEnabled;
    setNotificationsEnabled(nextValue);

    if (nextValue) {
      showInAppNotification({
        title: 'After lunch: 2 min walk',
        message: 'Lunch is done. Take a 2 minute walk to refresh your mind!',
        onDismiss: () => {},
      });
    }
  };

  const handleResetProgress = () => {
    Alert.alert('Reset account', 'All progress will be lost. Are you sure?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {},
      },
    ]);
  };

  const handleChooseImage = () => {
    Alert.alert('Coming soon', 'Profile pictures are not implemented.');
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete account', 'All data will be permanently deleted. Are you sure?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {},
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionHeading}>App settings</Text>

      <View style={styles.row}>
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowTitle}>Notifications</Text>
          <Text style={styles.rowSubtitle}>Get habit reminders</Text>
        </View>
        <Pressable style={styles.checkbox} onPress={handleToggleNotifications}>
          {notificationsEnabled ? <Text style={styles.checkmark}>✓</Text> : null}
        </Pressable>
      </View>

      <View style={styles.row}>
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowTitle}>Reset progress</Text>
          <Text style={styles.rowSubtitle}>Reset earned points and levels</Text>
        </View>
        <Pressable style={styles.pillButton} onPress={handleResetProgress}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionHeading}>User settings</Text>

      <View style={styles.row}>
        <Text style={styles.rowTitle}>Profile name</Text>
        <View style={styles.nameChip}>
          <Text style={styles.nameText}>{profileName}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowTitle}>Profile picture</Text>
        <Pressable style={styles.pillButton} onPress={handleChooseImage}>
          <Text style={styles.pillButtonText}>Choose image</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowTitle}>Logout</Text>
        <Pressable style={styles.pillButton} onPress={handleLogout}>
          <Text style={styles.pillButtonText}>{isSigningOut ? 'Logging out...' : 'Logout'}</Text>
        </Pressable>
      </View>

      <View style={styles.rowDelete}>
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowTitle}>Delete account</Text>
          <Text style={styles.rowSubtitle}>All user data will be deleted</Text>
        </View>
        <Pressable style={[styles.pillButton, styles.rowDeleteButton]} onPress={handleDeleteAccount}>
          <Text style={styles.resetText}>Delete</Text>
        </Pressable>
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  sectionHeading: {
    fontSize: 14,
    color: Colors.textMedium,
    marginBottom: 25,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  rowDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  rowDeleteButton: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 20,
    lineHeight: 25,
    color: Colors.textDark,
    fontWeight: '400',
  },
  rowSubtitle: {
    fontSize: 11,
    lineHeight: 20,
    color: Colors.textMedium,
    marginTop: 2,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.softAccent,
    backgroundColor: Colors.strongAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: Colors.textDark,
    fontSize: 20,
    fontWeight: '700',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.textMedium,
    marginTop: 6,
    marginBottom: 20,
  },
  pillButton: {
    minWidth: 110,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.textMedium,
    backgroundColor: Colors.strongAccent,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignItems: 'center',
  },
  pillButtonText: {
    color: Colors.textDark,
    fontSize: 12,
  },
  resetText: {
    color: Colors.errorRed,
    fontSize: 12,
    fontWeight: '500',
  },
  nameChip: {
    minWidth: 172,
    borderRadius: 18,
    backgroundColor: '#FDE8D2',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  nameText: {
    color: Colors.textMedium,
    fontSize: 16,
  },
  error: {
    color: Colors.errorRed,
    marginTop: 10,
    textAlign: 'left',
    fontSize: 14,
  },
});
