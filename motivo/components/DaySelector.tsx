import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Pressable } from 'react-native';
import { Colors } from '../constants/colors';
import { fetchUserHabits } from '../lib/habitOperations';
import { Habit } from '../lib/models/habits';
import { supabase } from '../lib/supabase';

type Props = {
  onDateChange: (date: string) => void;
  userId: string;
  reloadTrigger: number;
};

type Day = {
  label: string;
  date: string;
  isToday: boolean;
};

type CompletionRow = {
  completed_date: string;
  habit_id: string;
};

type HabitRow = {
  id: string;
  created_at: string;
};

const ITEM_SIZE = 50;
const SPACING = 12;
const STEP = ITEM_SIZE + SPACING;

const SCREEN_WIDTH = Dimensions.get('window').width;

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const generateDays = (): Day[] => {
  const today = new Date();

  return Array.from({ length: 10 }, (_, i) => {
    const offset = i - 7;

    const date = new Date(today);
    date.setDate(today.getDate() + offset);

    return {
      label: date.getDate().toString(),
      date: formatDate(date),
      isToday: offset === 0,
    };
  });
};

const fetchCompletions = async (userId: string) => {
  const { data, error } = await supabase
    .from('habit_completions')
    .select('completed_date, habit_id')
    .eq('user_id', userId);

  if (error) throw error;

  return (data ?? []) as CompletionRow[];
};

const fetchHabits = async () => {
  const { data, error } = await fetchUserHabits();

  if (error) {
    throw new Error(error);
  }

  return ((data as Habit[]) ?? []).map((habit) => ({
    id: habit.id,
    created_at: habit.created_at,
  })) as HabitRow[];
};

const getLocalDateString = (isoDate: string) => formatDate(new Date(isoDate));

const buildDayStatusMaps = (days: Day[], habits: HabitRow[], completions: CompletionRow[]) => {
  const requiredMap: Record<string, number> = {};
  const completedMap: Record<string, number> = {};

  const completionsByDate = completions.reduce<Record<string, CompletionRow[]>>((acc, row) => {
    if (!acc[row.completed_date]) {
      acc[row.completed_date] = [];
    }
    acc[row.completed_date].push(row);
    return acc;
  }, {});

  for (const day of days) {
    const eligibleHabitIds = new Set(
      habits
        .filter((habit) => getLocalDateString(habit.created_at) <= day.date)
        .map((habit) => habit.id),
    );

    requiredMap[day.date] = eligibleHabitIds.size;

    const completedIdsForDay = new Set(
      (completionsByDate[day.date] ?? [])
        .map((row) => row.habit_id)
        .filter((habitId) => eligibleHabitIds.has(habitId)),
    );

    completedMap[day.date] = completedIdsForDay.size;
  }

  return { requiredMap, completedMap };
};

export const DaySelector = ({ onDateChange, userId, reloadTrigger = 0 }: Props) => {
  const days = useMemo(generateDays, []);
  const listRef = useRef<FlatList>(null);

  const todayIndex = days.findIndex((d) => d.isToday);
  const [selectedIndex, setSelectedIndex] = useState(todayIndex);
  const [completedCountMap, setCompletedCountMap] = useState<Record<string, number>>({});
  const [requiredHabitCountMap, setRequiredHabitCountMap] = useState<Record<string, number>>({});
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    onDateChange(days[selectedIndex].date);
  }, [days, onDateChange, selectedIndex]);

  useEffect(() => {
    setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: todayIndex,
        animated: false,
        viewPosition: 0.5,
      });
    }, 0);
  }, [todayIndex]);

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setCompletedCountMap({});
        setRequiredHabitCountMap({});
        setStatsLoaded(true);
        return;
      }

      setStatsLoaded(false);

      try {
        const [completionRows, habits] = await Promise.all([
          fetchCompletions(userId),
          fetchHabits(),
        ]);

        const { requiredMap, completedMap } = buildDayStatusMaps(days, habits, completionRows);

        setRequiredHabitCountMap(requiredMap);
        setCompletedCountMap(completedMap);
      } catch (error) {
        console.error('Error loading day selector stats:', error);
        setCompletedCountMap({});
        setRequiredHabitCountMap({});
      } finally {
        setStatsLoaded(true);
      }
    };

    load();
  }, [days, userId, reloadTrigger]);

  const onSelect = (index: number) => {
    setSelectedIndex(index);

    listRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={days}
        keyExtractor={(item) => item.date}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        snapToInterval={STEP}
        decelerationRate="fast"
        renderItem={({ item, index }) => {
          const isSelected = index === selectedIndex;
          const isToday = item.isToday;

          const completions = completedCountMap[item.date] ?? 0;
          const requiredHabits = requiredHabitCountMap[item.date] ?? 0;
          const isComplete =
            statsLoaded && requiredHabits > 0 && completions > 0 && completions >= requiredHabits;
          const isPast = index < todayIndex;

          const colorStyle = isComplete ? styles.complete : styles.incomplete;

          return (
            <Pressable onPress={() => onSelect(index)} style={styles.wrapper}>
              <View style={[styles.bubble, isToday && styles.today, isSelected && styles.selected]}>
                <Text style={[styles.text, isToday && styles.todayText]}>
                  {isToday ? 'Today' : item.label}
                </Text>
                {isPast && <View style={[styles.innerDot, colorStyle]} />}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.daySelectorBackground,
    maxHeight: 80,
  },
  content: {
    paddingHorizontal: SCREEN_WIDTH / 2 - ITEM_SIZE / 2,
    alignItems: 'center',
  },
  wrapper: {
    width: STEP,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    backgroundColor: Colors.daySelectorBackground,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    position: 'relative',
  },
  today: {
    backgroundColor: Colors.primaryGreen,
    width: ITEM_SIZE * 1.25,
    borderRadius: 22.5,
  },
  selected: {
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
    transform: [{ scale: 1.1 }],
  },
  text: {
    marginTop: -8,
    color: Colors.textDark,
    fontWeight: '600',
  },
  todayText: {
    marginTop: 0,
  },
  innerDot: {
    position: 'absolute',
    bottom: 8,
    width: 7,
    height: 7,
    borderRadius: 100,
  },
  complete: {
    backgroundColor: Colors.primaryGreen,
  },
  incomplete: {
    backgroundColor: Colors.textDark,
  },
});
