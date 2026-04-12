import type { GoalType } from './models/habits';
import { supabase } from './supabase';

export interface CreateHabitInput {
  name: string;
  trigger: string | null;
  goalType: GoalType;
  goalValue: Record<string, unknown>;
  fallbackValue: Record<string, unknown> | null;
}

export const createHabit = async (input: CreateHabitInput): Promise<{ error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be logged in to create a habit.' };
    }

    const { error } = await supabase.from('habits').insert({
      user_id: user.id,
      name: input.name,
      trigger: input.trigger,
      goal_type: input.goalType,
      goal_value: input.goalValue,
      fallback: input.fallbackValue,
      is_active: true,
    });

    if (error) {
      console.error('Error creating habit:', error);
      return { error: 'Could not create habit. Please try again.' };
    }

    return {};
  } catch (createError) {
    console.error('Error creating habit:', createError);
    return { error: 'Could not create habit. Please try again.' };
  }
};

export const fetchUserHabits = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('habits')
      .select('id, name, trigger, goal_type, goal_value, fallback, created_at, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading habits:', error);
      return { data: null, error: 'Could not load habits' };
    }

    return { data: data ?? [], error: null };
  } catch (loadError) {
    console.error('Error loading habits:', loadError);
    return { data: null, error: 'Could not load habits' };
  }
};

export const deleteHabit = async (habitId: string): Promise<{ error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('habits')
      .update({ is_active: false })
      .eq('id', habitId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting habit:', error);
      return { error: 'Could not delete the habit. Please try again.' };
    }

    return {};
  } catch (deleteError) {
    console.error('Error deleting habit:', deleteError);
    return { error: 'Could not delete the habit. Please try again.' };
  }
};
