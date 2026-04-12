import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, StyleSheet, View, SectionList } from 'react-native';
import LottieView from 'lottie-react-native';
import { Toast } from 'rn-inkpad';
import { useFocusEffect } from '@react-navigation/native';

import { supabase } from '../lib/supabase';
import { fetchUserHabits } from '../lib/habitOperations';
import { Colors } from '../constants/colors';
import { HabitCard } from '../components/HabitCard';
import { Habit } from '../lib/models/habits';
import { ProgressCard } from '../components/ProgressCard';
import { DaySelector } from '../components/DaySelector';
import { withOpacity } from '../utils/colors';
import { recalculateAndPersistStreak } from '../lib/streakOperations';
import { notifyProfileRefresh } from '../lib/profileRefresh';

interface HabitWithCompletion extends Habit {
  completed: boolean;
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getTodayDate = () => formatDate(new Date());

export default function HomeScreen() {
  const [habits, setHabits] = useState<HabitWithCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFireworks, setShowFireworks] = useState(true);
  const [animationLoopCounter, setAnimationLoopCounter] = useState(0);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [userId, setUserId] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorToastMessage, setErrorToastMessage] = useState('');

  const fetchHabits = async (userId: string) => {
    setLoading(true);

    const { data, error } = await fetchUserHabits();

    setUserId(userId);

    if (error) {
      console.error('Error fetching habits:', error);
      setLoading(false);
      return;
    }

    const today = selectedDate;
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
    setLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await fetchHabits(user.id);
    };

    load();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      await fetchHabits(userId);
    };

    load();
  }, [selectedDate, userId]);

  useFocusEffect(
    React.useCallback(() => {
      if (!userId) {
        return;
      }

      fetchHabits(userId);
      setReloadTrigger((prev) => prev + 1);
    }, [selectedDate, userId]),
  );

  const handleToggle = async (id: string) => {
    var today = formatDate(new Date());

    if (selectedDate > today) {
      setErrorToastMessage("You can't complete a habit for a future date.");
      setShowErrorToast(true);
      return;
    }

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

      today = selectedDate;

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

      await recalculateAndPersistStreak(user.id);
      notifyProfileRefresh();
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
      setReloadTrigger((prev) => prev + 1);
    }
  };

  const visibleHabits = habits.filter((habit) => {
    const createdDate = habit.created_at.slice(0, 10);
    return createdDate <= selectedDate;
  });

  const activeHabits = visibleHabits.filter((h) => !h.completed);
  const completedHabits = visibleHabits.filter((h) => h.completed);

  const isAllCompleted =
    visibleHabits.length > 0 && completedHabits.length === visibleHabits.length;

  return (
    <>
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
          <ProgressCard
            nbCompletedHabits={completedHabits.length}
            nbTotalHabits={visibleHabits.length}
          />
        </View>
        <DaySelector
          onDateChange={setSelectedDate}
          userId={userId || ''}
          reloadTrigger={reloadTrigger}
        />
        {loading ? <ActivityIndicator size="large" color={Colors.primaryGreen} /> : null}
        {!loading && visibleHabits.length > 0 && (
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

        {!loading && visibleHabits.length === 0 && (
          <View style={styles.center}>
            <Text style={styles.subtitle}>💤 No habits yet 💤</Text>
            <Text style={styles.subtitle}>Add your first habit to get started</Text>
          </View>
        )}
        <Toast
          text={errorToastMessage}
          visible={showErrorToast}
          setVisible={setShowErrorToast}
          position="bottom"
          bottom={50}
          backgroundColor={withOpacity(Colors.errorRed, 0.85)}
          icon="alert-circle-outline"
        />
      </View>
    </>
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
  subtitle: {
    fontSize: 16,
    color: Colors.textMedium,
    textAlign: 'center',
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
