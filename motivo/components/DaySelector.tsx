import React, { use, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Pressable } from 'react-native';
import { Colors } from '../constants/colors';
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
    .select('completed_date')
    .eq('user_id', userId);

  if (error) throw error;

  return data;
};

const buildCompletionMap = (rows: { completed_date: string }[]) => {
  const map: Record<string, number> = {};

  for (const row of rows) {
    const date = row.completed_date;

    map[date] = (map[date] || 0) + 1;
  }

  return map;
};

const fetchHabitsCount = async (userId: string) => {
  const { data: habits, error } = await supabase
    .from('habits')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error || !habits) {
    console.error('Error fetching habits count:', error);
    return 0;
  }

  return habits.length;
};

export const DaySelector = ({ onDateChange, userId, reloadTrigger = 0 }: Props) => {
  const days = useMemo(generateDays, []);
  const listRef = useRef<FlatList>(null);

  const todayIndex = days.findIndex((d) => d.isToday);
  const [selectedIndex, setSelectedIndex] = useState(todayIndex);
  const [completionMap, setCompletionMap] = useState<Record<string, number>>({});
  const [totalHabits, setTotalHabits] = useState(0);

  useEffect(() => {
    onDateChange(days[selectedIndex].date);

    setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: todayIndex,
        animated: false,
        viewPosition: 0.5,
      });
    }, 0);

    const load = async () => {
      const data = await fetchCompletions(userId);
      const map = buildCompletionMap(data);
      const habitsCount = await fetchHabitsCount(userId);

      setCompletionMap(map);
      setTotalHabits(habitsCount);
    };

    load();
  }, [userId, selectedIndex]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchCompletions(userId);
      const map = buildCompletionMap(data);
      const habitsCount = await fetchHabitsCount(userId);

      setCompletionMap(map);
      setTotalHabits(habitsCount);
    };

    load();
  }, [userId, reloadTrigger]);

  const onSelect = (index: number) => {
    setSelectedIndex(index);
    onDateChange(days[index].date);

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

          const completions = completionMap[item.date] ?? 0;
          const isComplete = completions >= totalHabits;
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
