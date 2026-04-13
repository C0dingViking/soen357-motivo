import { fetchUserHabits } from './habitOperations';
import type { Habit } from './models/habits';
import { supabase } from './supabase';

type CompletionRow = {
  completed_date: string;
  habit_id: string;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getLocalDateString = (isoDate: string) => formatDate(new Date(isoDate));

const getPreviousDate = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return formatDate(date);
};

const getCurrentStreakWithLeeway = (habits: Habit[], completionRows: CompletionRow[]) => {
  if (habits.length === 0) {
    return 0;
  }

  const completionsByDate = completionRows.reduce<Record<string, Set<string>>>((acc, row) => {
    if (!acc[row.completed_date]) {
      acc[row.completed_date] = new Set();
    }
    acc[row.completed_date].add(row.habit_id);
    return acc;
  }, {});

  const habitCreatedDateMap = new Map<string, string>();
  for (const habit of habits) {
    habitCreatedDateMap.set(habit.id, getLocalDateString(habit.created_at));
  }

  const allCreationDates = Array.from(habitCreatedDateMap.values());
  const earliestHabitDate = allCreationDates.sort()[0];

  if (!earliestHabitDate) {
    return 0;
  }

  const todayDate = formatDate(new Date());
  let indexDate = todayDate;
  let pendingMisses = 0;
  let pendingMissIncludesToday = false;
  let streak = 0;

  while (indexDate >= earliestHabitDate) {
    const eligibleHabitIds = Array.from(habitCreatedDateMap.entries())
      .filter(([, createdDate]) => createdDate <= indexDate)
      .map(([habitId]) => habitId);

    if (eligibleHabitIds.length === 0) {
      break;
    }

    const completedHabitIds = completionsByDate[indexDate] ?? new Set<string>();
    const completedEligibleCount = eligibleHabitIds.filter((habitId) =>
      completedHabitIds.has(habitId),
    ).length;

    const isDayComplete = completedEligibleCount >= eligibleHabitIds.length;

    if (isDayComplete) {
      if (pendingMisses >= 2) {
        break;
      }

      streak += 1;

      if (pendingMisses === 1 && !pendingMissIncludesToday) {
        streak += 1;
      }

      pendingMisses = 0;
      pendingMissIncludesToday = false;
    } else {
      pendingMisses += 1;

      if (indexDate === todayDate) {
        pendingMissIncludesToday = true;
      }

      if (pendingMisses >= 2) {
        break;
      }
    }

    indexDate = getPreviousDate(indexDate);
  }

  return streak;
};

export const recalculateAndPersistStreak = async (userId: string): Promise<number> => {
  const { data: habitsData, error: habitsError } = await fetchUserHabits();

  if (habitsError) {
    throw new Error(habitsError);
  }

  const habits = ((habitsData as Habit[]) ?? []).filter((habit) => habit.is_active);

  const { data: completionData, error: completionError } = await supabase
    .from('habit_completions')
    .select('completed_date, habit_id')
    .eq('user_id', userId);

  if (completionError) {
    throw completionError;
  }

  const streak = getCurrentStreakWithLeeway(habits, (completionData ?? []) as CompletionRow[]);

  const { error: profileError } = await supabase.from('profiles').update({ streak }).eq('id', userId);

  if (profileError) {
    throw profileError;
  }

  return streak;
};

export const recalculateAndPersistStreakForCurrentUser = async (): Promise<number | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return recalculateAndPersistStreak(user.id);
};
