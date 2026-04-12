import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Colors } from '../constants/colors';
import type { GoalType } from '../lib/models/habits';
import { createHabit, updateHabit, fetchUserHabits } from '../lib/habitOperations';
import { recalculateAndPersistStreakForCurrentUser } from '../lib/streakOperations';
import type { ManageStackParamList } from '../navigation/types';
import BackButton from '../components/buttons/BackButton';
import AddButton from '../components/buttons/AddButton';

type Props = NativeStackScreenProps<ManageStackParamList, 'ManageDetails'>;

export default function CreateHabitScreen({ navigation, route }: Props) {
  const habitId = route.params?.habitId;
  const isEditing = !!habitId;
  const goalTypes: GoalType[] = ['time', 'count', 'custom'];

  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('time');
  const [goalInput, setGoalInput] = useState('');
  const [fallbackInput, setFallbackInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [goalTypeRowWidth, setGoalTypeRowWidth] = useState(0);
  const animatedGoalTypeX = useRef(new Animated.Value(0)).current;

  const selectedGoalTypeIndex = goalTypes.indexOf(goalType);
  const goalTypeSegmentWidth = goalTypeRowWidth ? (goalTypeRowWidth - 8) / goalTypes.length : 0;

  const handleGoalTypeRowLayout = (event: LayoutChangeEvent) => {
    setGoalTypeRowWidth(event.nativeEvent.layout.width);
  };

  useEffect(() => {
    if (isEditing && habitId) {
      loadHabitData();
    }
  }, [habitId, isEditing]);

  const loadHabitData = async () => {
    setLoading(true);
    const { data, error } = await fetchUserHabits();
    if (error || !data) {
      Alert.alert('Error', 'Could not load habit details');
      setLoading(false);
      return;
    }

    const habit = (data as any[]).find((h) => h.id === habitId);
    if (habit) {
      setName(habit.name);
      setTrigger(habit.trigger || '');
      setGoalType(habit.goal_type);

      const goalValue = habit.goal_value;
      if (goalValue?.time) setGoalInput(String(goalValue.time));
      else if (goalValue?.count) setGoalInput(String(goalValue.count));
      else if (goalValue?.custom) setGoalInput(goalValue.custom);

      const fallbackValue = habit.fallback;
      if (fallbackValue?.time) setFallbackInput(String(fallbackValue.time));
      else if (fallbackValue?.count) setFallbackInput(String(fallbackValue.count));
      else if (fallbackValue?.custom) setFallbackInput(fallbackValue.custom);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!goalTypeSegmentWidth || selectedGoalTypeIndex < 0) {
      return;
    }

    Animated.timing(animatedGoalTypeX, {
      toValue: selectedGoalTypeIndex * goalTypeSegmentWidth,
      duration: 160,
      easing: Easing.out(Easing.linear),
      useNativeDriver: true,
    }).start();
  }, [animatedGoalTypeX, goalTypeSegmentWidth, selectedGoalTypeIndex]);

  const unitLabel = useMemo(() => {
    if (goalType === 'time') return 'min';
    if (goalType === 'count') return 'times';
    return 'text';
  }, [goalType]);

  const parseGoalValue = () => {
    if (goalType === 'custom') {
      const value = goalInput.trim();
      if (!value) return null;
      return { custom: value };
    }

    const numeric = Number(goalInput.trim());
    if (!Number.isFinite(numeric) || numeric <= 0) return null;

    if (goalType === 'time') return { time: numeric };
    return { count: numeric };
  };

  const parseFallbackValue = () => {
    if (!fallbackInput.trim()) {
      return null;
    }

    if (goalType === 'custom') {
      return { custom: fallbackInput.trim() };
    }

    const numeric = Number(fallbackInput.trim());
    if (!Number.isFinite(numeric) || numeric <= 0) return null;

    if (goalType === 'time') return { time: numeric };
    return { count: numeric };
  };

  const getNumericValue = (value: Record<string, unknown> | null): number | null => {
    if (!value || goalType === 'custom') return null;

    if (goalType === 'time') {
      const time = value.time;
      return typeof time === 'number' ? time : null;
    }

    const count = value.count;
    return typeof count === 'number' ? count : null;
  };

  const handleAddHabit = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert('Validation', 'Habit name is required.');
      return;
    }

    const goalValue = parseGoalValue();
    if (!goalValue) {
      Alert.alert('Validation', `Please enter a valid goal (${unitLabel}).`);
      return;
    }

    const fallbackValue = parseFallbackValue();
    if (fallbackInput.trim() && !fallbackValue) {
      Alert.alert('Validation', `Please enter a valid fallback (${unitLabel}).`);
      return;
    }

    if (goalType !== 'custom' && fallbackValue) {
      const goalNumeric = getNumericValue(goalValue);
      const fallbackNumeric = getNumericValue(fallbackValue);

      if (goalNumeric !== null && fallbackNumeric !== null && fallbackNumeric >= goalNumeric) {
        Alert.alert('Validation', `Fallback must be less than goal (${unitLabel}).`);
        return;
      }
    }

    setSubmitting(true);

    const habitData = {
      name: trimmedName,
      trigger: trigger.trim() || null,
      goalType,
      goalValue,
      fallbackValue,
    };

    let error: string | undefined;

    if (isEditing && habitId) {
      const result = await updateHabit(habitId, habitData);
      error = result.error;
    } else {
      const result = await createHabit(habitData);
      error = result.error;
    }

    setSubmitting(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    if (!isEditing) {
      try {
        await recalculateAndPersistStreakForCurrentUser();
      } catch (streakError) {
        console.error('Error recalculating streak after add:', streakError);
      }
    }

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <BackButton onPress={() => navigation.goBack()} />

        <View style={styles.form}>
          <Text style={styles.label}>Habit name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor={Colors.textMedium}
          />

          <Text style={styles.label}>
            Habit Trigger <Text style={styles.helperText}>(something you do already)</Text>
          </Text>
          <TextInput
            value={trigger}
            onChangeText={setTrigger}
            style={styles.input}
            placeholder=""
            placeholderTextColor={Colors.textMedium}
          />

          <View style={styles.goalTypeRow} onLayout={handleGoalTypeRowLayout}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.goalTypeIndicator,
                {
                  width: goalTypeSegmentWidth,
                  transform: [{ translateX: animatedGoalTypeX }],
                },
              ]}
            />
            {goalTypes.map((type) => {
              return (
                <Pressable
                  key={type}
                  style={styles.goalTypeChip}
                  onPress={() => {
                    setGoalType(type);
                    setGoalInput('');
                    setFallbackInput('');
                  }}
                >
                  <Text style={styles.goalTypeText}>
                    {type.charAt(0).toUpperCase()}
                    {type.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.goalFallbackRow}>
            <View style={styles.goalFallbackItem}>
              <Text style={styles.label}>Goal</Text>
            </View>

            <View style={styles.goalFallbackItem}>
              <Text style={styles.label}>Fallback</Text>
              <Text style={styles.helperText}>(make it a bit easier)</Text>
            </View>
          </View>

          <View style={styles.goalFallbackRow}>
            <View style={styles.goalFallbackItem}>
              <TextInput
                value={goalInput}
                onChangeText={setGoalInput}
                style={styles.smallInput}
                keyboardType={goalType === 'custom' ? 'default' : 'numeric'}
                placeholder={unitLabel}
                placeholderTextColor={Colors.textMedium}
              />
            </View>

            <View style={styles.goalFallbackItem}>
              <TextInput
                value={fallbackInput}
                onChangeText={setFallbackInput}
                style={styles.smallInput}
                keyboardType={goalType === 'custom' ? 'default' : 'numeric'}
                placeholder={unitLabel}
                placeholderTextColor={Colors.textMedium}
              />
            </View>
          </View>
        </View>

        <AddButton
          label={
            submitting ? (isEditing ? 'Updating...' : 'Adding...') : isEditing ? 'Update' : 'Add'
          }
          onPress={handleAddHabit}
          disabled={submitting || loading}
          style={styles.addButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
  },
  form: {
    gap: 10,
    paddingLeft: 30,
    paddingRight: 50,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginLeft: 5,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textMedium,
    marginLeft: 5,
    marginVertical: -5,
  },
  input: {
    backgroundColor: Colors.softAccent,
    borderRadius: 16,
    height: 48,
    paddingHorizontal: 16,
    color: Colors.textDark,
    fontSize: 16,
    marginBottom: 10,
  },
  goalTypeRow: {
    flexDirection: 'row',
    backgroundColor: Colors.softAccent,
    borderRadius: 26,
    padding: 4,
    marginTop: 2,
    marginBottom: 10,
    marginHorizontal: 30,
    overflow: 'hidden',
  },
  goalTypeIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 22,
    backgroundColor: Colors.strongAccent,
  },
  goalTypeChip: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  goalTypeText: {
    color: Colors.textDark,
    fontSize: 18,
  },
  goalFallbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  goalFallbackItem: {
    flex: 1,
  },
  smallInput: {
    backgroundColor: Colors.softAccent,
    borderRadius: 16,
    height: 48,
    paddingHorizontal: 16,
    color: Colors.textDark,
    fontSize: 16,
    textAlign: 'right',
  },
  addButton: {
    marginTop: 'auto',
    alignSelf: 'center',
    marginBottom: 32,
  },
});
