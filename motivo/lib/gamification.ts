import diamondBadge from '../assets/diamond-amethyst-1.png';
import orangeFlameBadge from '../assets/streaks/orange/burning_loop_1.png';
import goldShieldBadge from '../assets/ranks/shield-gold-1.png';
import unrankedBadge from '../assets/ranks/shield-unranked.png';
import { supabase } from './supabase';

type ProfileRow = {
  full_name: string | null;
  streak: number | null;
};

type CompletionRow = {
  completed_date: string;
};

type BadgeId = 'shield' | 'diamond' | 'flame';

type BadgeDefinition = {
  id: BadgeId;
  icon: number;
  threshold: number;
};

export type GamificationBadge = BadgeDefinition & {
  earned: boolean;
  earnedOn: string | null;
  earnedLabel: string | null;
  pointsLabel: string;
};

export type GamificationSnapshot = {
  name: string;
  points: number;
  streak: number;
  level: number;
  levelStep: number;
  levelStepGoal: number;
  levelProgressRatio: number;
  badges: GamificationBadge[];
  latestBadge: GamificationBadge | null;
  nextBadge: GamificationBadge | null;
  headerBadgeIcon: number;
};

const POINTS_PER_COMPLETION = 300;
const POINTS_PER_ACTIVE_DAY = 270;
const LEVEL_POINT_SPAN = 650;
const LEVEL_STEP_GOAL = 8;

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'shield',
    icon: goldShieldBadge,
    threshold: 4500,
  },
  {
    id: 'diamond',
    icon: diamondBadge,
    threshold: 5000,
  },
  {
    id: 'flame',
    icon: orangeFlameBadge,
    threshold: 5500,
  },
];

const formatName = (fullName: string | null | undefined) => {
  const trimmedName = fullName?.trim();

  if (!trimmedName) {
    return 'User';
  }

  return trimmedName.split(/\s+/)[0] || 'User';
};

const formatEarnedDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-');

  if (!year || !month || !day) {
    return dateString;
  }

  return `${month}/${day}/${year}`;
};

export const formatGamificationPoints = (points: number) => `${Math.round(points)} pts`;

const buildSnapshot = (
  name: string,
  streak: number,
  cumulativePointsByDate: Array<{ date: string; points: number }>,
): GamificationSnapshot => {
  // Keep rewards monotonic by deriving lifetime points from cumulative completions and active days.
  const points =
    cumulativePointsByDate.length > 0
      ? cumulativePointsByDate[cumulativePointsByDate.length - 1].points
      : 0;

  const badges = BADGE_DEFINITIONS.map((badge) => {
    const earnedOn =
      cumulativePointsByDate.find((milestone) => milestone.points >= badge.threshold)?.date ?? null;

    return {
      ...badge,
      earned: !!earnedOn,
      earnedOn,
      earnedLabel: earnedOn ? `Earned ${formatEarnedDate(earnedOn)}` : null,
      pointsLabel: formatGamificationPoints(badge.threshold),
    };
  });

  const latestBadge = [...badges].reverse().find((badge) => badge.earned) ?? null;
  const nextBadge = badges.find((badge) => !badge.earned) ?? null;

  const level = Math.max(1, Math.floor(points / LEVEL_POINT_SPAN) + 1);
  const levelBase = (level - 1) * LEVEL_POINT_SPAN;
  const levelProgressRatio = Math.max(0, Math.min(1, (points - levelBase) / LEVEL_POINT_SPAN));
  const levelStep =
    points <= 0 ? 0 : Math.min(LEVEL_STEP_GOAL, Math.floor(levelProgressRatio * LEVEL_STEP_GOAL));

  return {
    name,
    points,
    streak,
    level,
    levelStep,
    levelStepGoal: LEVEL_STEP_GOAL,
    levelProgressRatio,
    badges,
    latestBadge,
    nextBadge,
    headerBadgeIcon: latestBadge?.icon ?? nextBadge?.icon ?? unrankedBadge,
  };
};

export const createFallbackGamificationSnapshot = (name = 'User'): GamificationSnapshot =>
  buildSnapshot(name, 0, []);

export const fetchGamificationSnapshotForCurrentUser = async (): Promise<GamificationSnapshot> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return createFallbackGamificationSnapshot();
  }

  try {
    const [{ data: profileData, error: profileError }, { data: completionData, error: completionError }] =
      await Promise.all([
        supabase.from('profiles').select('full_name, streak').eq('id', user.id).single(),
        supabase
          .from('habit_completions')
          .select('completed_date')
          .eq('user_id', user.id)
          .order('completed_date', { ascending: true }),
      ]);

    if (profileError) {
      console.error('Error fetching gamification profile:', profileError);
    }

    if (completionError) {
      console.error('Error fetching gamification completions:', completionError);
    }

    const profile = (profileData ?? null) as ProfileRow | null;
    const completions = ((completionData ?? []) as CompletionRow[]).reduce<Record<string, number>>(
      (accumulator, row) => {
        accumulator[row.completed_date] = (accumulator[row.completed_date] ?? 0) + 1;
        return accumulator;
      },
      {},
    );

    let runningPoints = 0;
    const cumulativePointsByDate = Object.keys(completions)
      .sort()
      .map((date) => {
        runningPoints += completions[date] * POINTS_PER_COMPLETION + POINTS_PER_ACTIVE_DAY;
        return {
          date,
          points: runningPoints,
        };
      });

    return buildSnapshot(
      formatName(profile?.full_name),
      typeof profile?.streak === 'number' ? profile.streak : 0,
      cumulativePointsByDate,
    );
  } catch (error) {
    console.error('Error building gamification snapshot:', error);
    return createFallbackGamificationSnapshot();
  }
};
