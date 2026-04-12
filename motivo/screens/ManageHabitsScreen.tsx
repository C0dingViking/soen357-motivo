import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Colors } from '../constants/colors';
import { Habit } from '../lib/models/habits';
import { supabase } from '../lib/supabase';
import { HabitCard } from '../components/HabitCard';

export default function ManageHabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHabits = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setHabits([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('habits')
        .select('id, name, trigger, goal_type, goal_value, fallback, created_at, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading habits:', error);
        setHabits([]);
        setLoading(false);
        return;
      }

      setHabits((data ?? []) as Habit[]);
    } catch (loadError) {
      console.error('Error loading habits:', loadError);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [loadHabits]),
  );

  const deleteHabit = useCallback(async (habitId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', habitId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting habit:', error);
        Alert.alert('Error', 'Could not delete the habit. Please try again.');
        return;
      }

      setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
    } catch (deleteError) {
      console.error('Error deleting habit:', deleteError);
      Alert.alert('Error', 'Could not delete the habit. Please try again.');
    }
  }, []);

  const handleDeletePress = useCallback(
    (habitId: string) => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      Alert.alert('Delete habit?', `Are you sure you want to delete "${habit.name}"?`, [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteHabit(habit.id);
          },
        },
      ]);
    },
    [deleteHabit, habits],
  );

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator size="large" color={Colors.primaryGreen} /> : null}

      {!loading && habits.length > 0 && (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HabitCard
              id={item.id}
              name={item.name}
              type={item.goal_type}
              fallback={item.fallback}
              goal={item.goal_value}
              completed={false}
              showCheckbox={false}
              showDeleteButton
              onDelete={handleDeletePress}
              motivate={false}
            />
          )}
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      )}

      {!loading && habits.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.subtitle}>No habits yet</Text>
        </View>
      )}

      <Pressable style={styles.addButton} onPress={() => {}}>
        <Text style={styles.addButtonText}>Add</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  list: {
    flex: 1,
    width: '100%',
    padding: 10,
  },
  listContent: {
    paddingBottom: 132,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textMedium,
  },
  addButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: Colors.strongAccent,
    minWidth: 148,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 34,
    color: Colors.textDark,
    fontWeight: '500',
  },
});
