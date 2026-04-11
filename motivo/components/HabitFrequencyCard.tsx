import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors } from '../constants/colors';

type HabitFrequencyCardProps = {
  name: string;
  timesCompleted: number;
};

export const HabitFrequencyCard = ({ name, timesCompleted }: HabitFrequencyCardProps) => {
  const completionLabel = timesCompleted === 1 ? 'time' : 'times';

  return (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={1}>
        {name}
      </Text>
      <View style={styles.countContainer}>
        <Text style={styles.completionCount}>{timesCompleted}</Text>
        <Text style={styles.completionLabel}>{completionLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: Colors.cardBackground,
    marginBottom: 12,
    alignSelf: 'center',
  },
  title: {
    flex: 1,
    color: Colors.textDark,
    fontSize: 20,
    fontWeight: '400',
    marginRight: 12,
  },
  countContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  completionCount: {
    color: Colors.textDark,
    fontSize: 24,
    lineHeight: 26,
  },
  completionLabel: {
    color: Colors.textMedium,
    fontSize: 12,
    lineHeight: 16,
  },
});
