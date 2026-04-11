export type GoalType = 'time' | 'count' | 'custom';

export type Habit = {
  id: string;
  name: string;
  trigger: string | null;
  goal_type: GoalType;
  goal_value: Record<string, any> | null;
  fallback: Record<string, any> | null;
  created_at: string;
  is_active: boolean;
};
