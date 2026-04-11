import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { Colors } from '../constants/colors';
import { withOpacity } from '../utils/colors';

const MOTIVATION_PREFIXES = [
  'Busy?',
  'No time?',
  'Feeling unmotivated?',
  'Low energy?',
  'Keep it simple!',
  'Quick win!',
];

type HabitCardProps = {
  id: string;
  name: string;
  type: 'count' | 'time' | 'custom';
  fallback?: Record<string, any> | null;
  goal?: Record<string, any> | null;
  completed: boolean;
  onToggle: (id: string) => void;
};

export const HabitCard = ({
  id,
  name,
  type,
  goal,
  fallback,
  completed,
  onToggle,
}: HabitCardProps) => {
  const prefix = useMemo(() => {
    const i = Math.floor(Math.random() * MOTIVATION_PREFIXES.length);
    return MOTIVATION_PREFIXES[i];
  }, []);

  const goalValue = type === 'count' ? goal?.count : type === 'time' ? goal?.time : goal?.custom;

  const goalLabel = type === 'count' ? 'times' : type === 'time' ? 'mins' : '';

  const fallbackText =
    type === 'count' && fallback?.count != null
      ? `${fallback.count} times`
      : type === 'time' && fallback?.time != null
        ? `${fallback.time} mins`
        : type === 'custom' && fallback?.custom
          ? `${fallback.custom}`
          : '';

  const subtitle = completed
    ? 'Completed 🎉'
    : fallbackText
      ? `${prefix} \n\tTry: ${fallbackText}`
      : '';

  return (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <Pressable
          onPress={() => onToggle(id)}
          style={[styles.checkbox, completed && styles.checkboxChecked]}
        >
          {completed && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>

        <View style={styles.textContainer}>
          <Text style={[styles.title, completed && styles.titleCompleted]}>{name}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.divider} />
        <View style={styles.goalContainer}>
          <Text style={styles.goalNumber}>{goalValue}</Text>
          <Text style={styles.goalLabel}>{goalLabel}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.softAccent,
    backgroundColor: Colors.strongAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: withOpacity(Colors.primaryGreen, 0.5),
    borderColor: Colors.primaryGreen,
  },
  checkmark: {
    color: '#000',
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  subtitle: {
    color: Colors.textMedium,
    fontSize: 13,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    width: '20%',
    height: '100%',
  },
  divider: {
    width: 2,
    alignSelf: 'stretch',
    backgroundColor: Colors.textMedium,
    marginRight: 12,
  },
  goalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  goalLabel: {
    fontSize: 12,
    color: Colors.textMedium,
  },
});
