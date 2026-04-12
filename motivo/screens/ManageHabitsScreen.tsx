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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors } from '../constants/colors';
import { Habit } from '../lib/models/habits';
import { fetchUserHabits, deleteHabit as deleteHabitFromDb } from '../lib/habitOperations';
import { recalculateAndPersistStreakForCurrentUser } from '../lib/streakOperations';
import { HabitCard } from '../components/HabitCard';
import AddButton from '../components/buttons/AddButton';
import type { ManageStackParamList } from '../navigation/types';

export default function ManageHabitsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ManageStackParamList>>();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHabits = useCallback(async () => {
    setLoading(true);
    const { data, error } = await fetchUserHabits();
    if (error) {
      setHabits([]);
    } else {
      setHabits((data as Habit[]) ?? []);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [loadHabits]),
  );

  const deleteHabit = useCallback(async (habitId: string) => {
    const { error } = await deleteHabitFromDb(habitId);
    if (error) {
      Alert.alert('Error', error);
      return;
    }

    try {
      await recalculateAndPersistStreakForCurrentUser();
    } catch (streakError) {
      console.error('Error recalculating streak after delete:', streakError);
    }

    setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
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
            <Pressable onPress={() => navigation.navigate('ManageDetails', { habitId: item.id })}>
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
            </Pressable>
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

      <AddButton
        onPress={() => navigation.navigate('ManageDetails', {})}
        style={styles.addButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
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
  },
});
