import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, View, SectionList } from 'react-native';
import LottieView from 'lottie-react-native';

import { supabase } from '../lib/supabase';
import { Colors } from '../constants/colors';
import { HabitCard } from '../components/HabitCard';
import { Habit } from '../lib/models/habits';
import { ProgressCard } from '../components/ProgressCard';

interface HabitWithCompletion extends Habit {
  completed: boolean;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function HomeScreen() {
  const [fullName, setFullName] = useState('');
  const [habits, setHabits] = useState<HabitWithCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFireworks, setShowFireworks] = useState(true);
  const [animationLoopCounter, setAnimationLoopCounter] = useState(0);

  const fetchHabits = async (userId: string) => {
    const { data, error } = await supabase
      .from('habits')
      .select('id, name, trigger, goal_type, goal_value, fallback, created_at, is_active')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching habits:', error);
      return;
    }

    const today = getTodayDate();
    const { data: completionData, error: completionError } = await supabase
      .from('habit_completions')
      .select('habit_id')
      .eq('user_id', userId)
      .eq('completed_date', today);

    if (completionError) {
      console.error('Error fetching completion status:', completionError);
    }

    const completedHabitIds = new Set(
      (completionData ?? []).map((completion) => completion.habit_id),
    );

    const formatted: HabitWithCompletion[] = (data ?? []).map((habit) => ({
      ...habit,
      completed: completedHabitIds.has(habit.id),
    }));

    setHabits(formatted);
  };

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

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await fetchHabits(user.id);
      setLoading(false);
    };

    load();
    fetchProfile();
  }, []);

  const handleToggle = async (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const previousCompleted = habit.completed;
    const nextCompleted = !previousCompleted;

    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, completed: nextCompleted } : h)));

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user found');
      }

      const today = getTodayDate();

      if (nextCompleted) {
        const { data: existingRows, error: existingError } = await supabase
          .from('habit_completions')
          .select('id')
          .eq('user_id', user.id)
          .eq('habit_id', id)
          .eq('completed_date', today)
          .limit(1);

        if (existingError) {
          throw existingError;
        }

        if (!existingRows || existingRows.length === 0) {
          const { error: insertError } = await supabase.from('habit_completions').insert({
            user_id: user.id,
            habit_id: id,
            completed_date: today,
          });

          if (insertError) {
            throw insertError;
          }
        }
      } else {
        const { error: deleteError } = await supabase
          .from('habit_completions')
          .delete()
          .eq('user_id', user.id)
          .eq('habit_id', id)
          .eq('completed_date', today);

        if (deleteError) {
          throw deleteError;
        }
      }
    } catch (toggleError) {
      console.error('Error updating completion:', toggleError);
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, completed: previousCompleted } : h)),
      );
    } finally {
      if (habit && !habit.completed) {
        setShowFireworks(true);
        setAnimationLoopCounter(0);
      }
    }
  };

  const activeHabits = habits.filter((h) => !h.completed);
  const completedHabits = habits.filter((h) => h.completed);

  const isAllCompleted = habits.length > 0 && completedHabits.length === habits.length;

  return (
    <View style={styles.container}>
      <View style={styles.progressWrapper}>
        {isAllCompleted && showFireworks && animationLoopCounter < 5 && (
          <LottieView
            key={animationLoopCounter}
            source={require('../assets/lottie/Fireworks.json')}
            autoPlay
            loop={false}
            style={styles.fireworks}
            onAnimationFinish={() => {
              setAnimationLoopCounter((prev) => {
                const next = prev + 1;

                if (next >= 3) {
                  setShowFireworks(false);
                }

                return next;
              });
            }}
          />
        )}
        <ProgressCard nbCompletedHabits={completedHabits.length} nbTotalHabits={habits.length} />
      </View>
      {!loading && habits.length > 0 && (
        <SectionList
          sections={[
            { title: 'Active', data: activeHabits },
            { title: 'Completed', data: completedHabits },
          ]}
          renderItem={({ item }) => (
            <HabitCard
              id={item.id}
              name={item.name}
              type={item.goal_type}
              fallback={item.fallback}
              goal={item.goal_value}
              completed={item.completed}
              onToggle={handleToggle}
            />
          )}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}
        />
      )}

      {!loading && habits.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.subtitle}>💤 No habits yet 💤</Text>
          <Text style={styles.subtitle}>Add your first habit to get started</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    gap: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    padding: 20,
  },
  progressWrapper: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
  },
  fireworks: {
    position: 'absolute',
    top: -70,
    width: 220,
    height: 220,
    zIndex: 10,
    pointerEvents: 'none',
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
  habitsContainer: {
    flex: 1,
    padding: 16,
    width: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMedium,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
});
