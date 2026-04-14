import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DimensionValue,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';

import { Colors } from '../constants/colors';
import {
  createFallbackGamificationSnapshot,
  fetchGamificationSnapshotForCurrentUser,
  formatGamificationPoints,
  type GamificationBadge,
  type GamificationSnapshot,
} from '../lib/gamification';
import { subscribeProfileRefresh } from '../lib/profileRefresh';

const BadgeHistoryCard = ({ earned, icon, pointsLabel, earnedLabel }: GamificationBadge) => {
  return (
    <View style={[styles.badgeCard, !earned && styles.badgeCardLocked]}>
      <View style={styles.badgeRow}>
        <Image
          source={icon}
          style={[styles.badgeIcon, !earned && styles.badgeIconLocked]}
          resizeMode="contain"
        />
        <Text style={[styles.badgePoints, !earned && styles.badgePointsLocked]}>{pointsLabel}</Text>
      </View>

      {earnedLabel ? <Text style={styles.badgeEarned}>{earnedLabel}</Text> : <View style={styles.badgeEarnedSpacer} />}
    </View>
  );
};

export default function RewardsScreen() {
  const { width } = useWindowDimensions();
  const [snapshot, setSnapshot] = useState<GamificationSnapshot>(
    createFallbackGamificationSnapshot(),
  );

  const loadSnapshot = useCallback(async () => {
    const nextSnapshot = await fetchGamificationSnapshotForCurrentUser();
    setSnapshot(nextSnapshot);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSnapshot();
    }, [loadSnapshot]),
  );

  useEffect(() => {
    const unsubscribe = subscribeProfileRefresh(() => {
      loadSnapshot();
    });

    return unsubscribe;
  }, [loadSnapshot]);

  const orderedBadges = useMemo(() => [...snapshot.badges].reverse(), [snapshot.badges]);
  const highestThreshold = snapshot.badges[snapshot.badges.length - 1]?.threshold ?? 1;
  const progressTarget = snapshot.nextBadge?.threshold ?? highestThreshold;
  const progressValue = snapshot.nextBadge ? Math.min(snapshot.points, progressTarget) : progressTarget;
  const progressRatio = progressTarget > 0 ? progressValue / progressTarget : 0;
  const nextBadgeIcon = snapshot.nextBadge?.icon ?? snapshot.latestBadge?.icon ?? snapshot.headerBadgeIcon;
  const ringProgress = snapshot.levelStep / snapshot.levelStepGoal;
  const ringSize = Math.min(width - 112, 240);
  const ringStroke = Math.max(24, ringSize * 0.16);
  const ringRadius = (ringSize - ringStroke) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const progressLength = circumference * ringProgress;

  const progressFillStyle = useMemo<{ width: DimensionValue }>(
    () => ({
      width: progressRatio <= 0 ? '0%' : `${progressRatio * 100}%`,
    }),
    [progressRatio],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.nextBadgePill}>
        <Text style={styles.nextBadgeText}>
          {snapshot.nextBadge ? 'Next badge' : 'All badges unlocked'}
        </Text>
        <Image source={nextBadgeIcon} style={styles.nextBadgeIcon} resizeMode="contain" />
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Progress</Text>
          <Text style={styles.progressValue}>
            {Math.round(progressValue)} / {progressTarget} pts
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, progressFillStyle]} />
        </View>
      </View>

      <View style={styles.badgeList}>
        {orderedBadges.map((badge) => (
          <BadgeHistoryCard key={badge.id} {...badge} />
        ))}
      </View>

      <View style={styles.levelSection}>
        <Text style={styles.levelTitle}>
          Level <Text style={styles.levelAccent}>{snapshot.level}</Text>
        </Text>

        <View style={[styles.ringWrapper, { width: ringSize, height: ringSize }]}>
          <Svg width={ringSize} height={ringSize}>
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              stroke="#EAF6E8"
              strokeWidth={ringStroke}
              fill="none"
            />
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              stroke={Colors.primaryGreen}
              strokeWidth={ringStroke}
              fill="none"
              strokeDasharray={`${progressLength} ${circumference}`}
              strokeLinecap="round"
              rotation={-90}
              origin={`${ringSize / 2}, ${ringSize / 2}`}
            />
          </Svg>

          <View style={styles.ringCenter}>
            <Text style={styles.ringPrimary}>{snapshot.levelStep}</Text>
            <Text style={styles.ringSlash}>/</Text>
            <Text style={styles.ringSecondary}>{snapshot.levelStepGoal}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.pointsSummary}>{formatGamificationPoints(snapshot.points)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  nextBadgePill: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingLeft: 18,
    paddingRight: 12,
    paddingVertical: 10,
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  nextBadgeText: {
    fontSize: 17,
    color: '#61656D',
  },
  nextBadgeIcon: {
    width: 34,
    height: 34,
    marginLeft: 10,
  },
  progressCard: {
    backgroundColor: Colors.softAccent,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 18,
    borderWidth: 3,
    borderColor: '#F7C34D',
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  progressTitle: {
    fontSize: 18,
    color: '#121212',
  },
  progressValue: {
    fontSize: 18,
    color: '#2D3440',
  },
  progressTrack: {
    height: 24,
    backgroundColor: '#F7D894',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FFC84D',
  },
  badgeList: {
    gap: 24,
    marginBottom: 34,
  },
  badgeCard: {
    backgroundColor: Colors.softAccent,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 16,
  },
  badgeCardLocked: {
    opacity: 0.62,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  badgeIcon: {
    width: 52,
    height: 52,
  },
  badgeIconLocked: {
    opacity: 0.8,
  },
  badgePoints: {
    fontSize: 22,
    color: '#232A35',
  },
  badgePointsLocked: {
    color: '#5A606B',
  },
  badgeEarned: {
    alignSelf: 'flex-end',
    fontSize: 15,
    color: '#6A717B',
  },
  badgeEarnedSpacer: {
    height: 20,
  },
  levelSection: {
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 28,
    color: '#1E2430',
    marginBottom: 18,
  },
  levelAccent: {
    color: Colors.primaryGreen,
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringCenter: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ringPrimary: {
    fontSize: 56,
    lineHeight: 58,
    color: '#202633',
  },
  ringSlash: {
    fontSize: 48,
    lineHeight: 52,
    color: '#202633',
    marginHorizontal: 4,
  },
  ringSecondary: {
    fontSize: 48,
    lineHeight: 52,
    color: '#202633',
  },
  pointsSummary: {
    alignSelf: 'center',
    marginTop: 22,
    fontSize: 20,
    color: '#2D3440',
  },
});
