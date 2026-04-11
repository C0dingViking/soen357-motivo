import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Colors } from '../constants/colors';
import { HabitFrequencyCard } from '../components/HabitFrequencyCard';
import { supabase } from '../lib/supabase';
import { Habit } from '../lib/models/habits';

type HabitFrequency = {
  id: string;
  name: string;
  timesCompleted: number;
};

export default function ProgressScreen() {
  const [loading, setLoading] = useState(true);
  const [habitCounts, setHabitCounts] = useState<HabitFrequency[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [longestStreak, setLongestStreak] = useState(0);

  const loadProgress = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setHabits([]);
        setHabitCounts([]);
        setLongestStreak(0);
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('streak')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile streak:', profileError);
        setLongestStreak(0);
      } else {
        setLongestStreak(profileData?.streak ?? 0);
      }

      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('id, name, trigger, goal_type, goal_value, fallback, created_at, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (habitsError) {
        console.error('Error fetching habits:', habitsError);
        setHabits([]);
        setHabitCounts([]);
        setLoading(false);
        return;
      }

      const activeHabits = (habitsData ?? []) as Habit[];
      setHabits(activeHabits);

      const { data: completionsData, error: completionsError } = await supabase
        .from('habit_completions')
        .select('habit_id')
        .eq('user_id', user.id);

      if (completionsError) {
        console.error('Error fetching habit completions:', completionsError);
        setHabitCounts(
          activeHabits.map((habit) => ({
            id: habit.id,
            name: habit.name,
            timesCompleted: 0,
          })),
        );
        setLoading(false);
        return;
      }

      const completionsByHabit = (completionsData ?? []).reduce<Record<string, number>>(
        (accumulator, completion) => {
          accumulator[completion.habit_id] = (accumulator[completion.habit_id] ?? 0) + 1;
          return accumulator;
        },
        {},
      );

      const formatted = activeHabits.map((habit) => ({
        id: habit.id,
        name: habit.name,
        timesCompleted: completionsByHabit[habit.id] ?? 0,
      }));

      setHabitCounts(formatted);
    } catch (loadError) {
      console.error('Error loading progress:', loadError);
      setHabits([]);
      setHabitCounts([]);
      setLongestStreak(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress]),
  );

  const hasHabits = useMemo(() => habitCounts.length > 0, [habitCounts]);
  const totalHabitsCompleted = useMemo(
    () => habitCounts.reduce((sum, habit) => sum + habit.timesCompleted, 0),
    [habitCounts],
  );
  const newHabitsThisYear = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return habits.filter((habit) => new Date(habit.created_at).getFullYear() === currentYear).length;
  }, [habits]);

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        {loading ? <ActivityIndicator size="large" color={Colors.primaryGreen} /> : null}

        {!loading && hasHabits && (
          <FlatList
            data={habitCounts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <HabitFrequencyCard name={item.name} timesCompleted={item.timesCompleted} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator
          />
        )}

        {!loading && !hasHabits && (
          <View style={styles.emptyState}>
            <Text style={styles.subtitle}>No completed habits yet</Text>
            <Text style={styles.subtitle}>Finish a habit to see it appear here</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.statRow}>
          <View style={styles.statCardHalf}>
            <Text style={styles.statLabel}>New habits this year</Text>
            <Text style={styles.statValue}>{newHabitsThisYear}</Text>
          </View>

          <View style={styles.statCardHalf}>
            <Text style={styles.statLabel}>Longest streak</Text>
            <Text style={styles.statValue}>{longestStreak}</Text>
          </View>
        </View>

        <View style={styles.statCardFull}>
          <Text style={styles.statLabel}>Total tasks completed</Text>
          <Text style={styles.statValue}>{totalHabitsCompleted}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    textAlign: 'center',
  },
  topContainer: {
    width: '100%',
    marginTop: 10,
    maxHeight: '50%',
  },
  listContent: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCardHalf: {
    width: '48.5%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  statCardFull: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
  },
  statLabel: {
    fontSize: 16,
    color: Colors.textMedium,
    textAlign: 'center',
    fontWeight: 400,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 36,
    color: Colors.textDark,
    fontWeight: 400,
    lineHeight: 40,
  },
});
