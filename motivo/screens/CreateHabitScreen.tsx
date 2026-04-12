import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Colors } from '../constants/colors';
import type { GoalType } from '../lib/models/habits';
import { supabase } from '../lib/supabase';
import type { ManageStackParamList } from '../navigation/types';
import BackButton from '../components/BackButton';
import AddButton from '../components/AddButton';

type Props = NativeStackScreenProps<ManageStackParamList, 'ManageDetails'>;

export default function CreateHabitScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('time');
  const [goalInput, setGoalInput] = useState('');
  const [fallbackInput, setFallbackInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Error', 'You must be logged in to create a habit.');
        return;
      }

      const { error } = await supabase.from('habits').insert({
        user_id: user.id,
        name: trimmedName,
        trigger: trigger.trim() || null,
        goal_type: goalType,
        goal_value: goalValue,
        fallback: fallbackValue,
        is_active: true,
      });

      if (error) {
        console.error('Error creating habit:', error);
        Alert.alert('Error', 'Could not create habit. Please try again.');
        return;
      }

      navigation.goBack();
    } catch (createError) {
      console.error('Error creating habit:', createError);
      Alert.alert('Error', 'Could not create habit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const goalTypes: GoalType[] = ['time', 'count', 'custom'];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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

        <View style={styles.goalTypeRow}>
          {goalTypes.map((type) => {
            const selected = goalType === type;
            return (
              <Pressable
                key={type}
                style={[styles.goalTypeChip, selected && styles.goalTypeChipSelected]}
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
        label={submitting ? 'Adding...' : 'Add'}
        onPress={handleAddHabit}
        disabled={submitting}
        style={styles.addButton}
      />
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
  },
  goalTypeChip: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTypeChipSelected: {
    backgroundColor: Colors.strongAccent,
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
