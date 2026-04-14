import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../constants/colors';
import { subscribeProfileRefresh } from '../lib/profileRefresh';
import logo from '../assets/logo_without_name.png';
import { withOpacity } from '../utils/colors';
import {
  createFallbackGamificationSnapshot,
  fetchGamificationSnapshotForCurrentUser,
  formatGamificationPoints,
  type GamificationSnapshot,
} from '../lib/gamification';

export default function Header() {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState<GamificationSnapshot>(createFallbackGamificationSnapshot());

  useEffect(() => {
    const loadUser = async () => {
      const snapshot = await fetchGamificationSnapshotForCurrentUser();
      setUserData(snapshot);
    };

    loadUser();

    const unsubscribe = subscribeProfileRefresh(() => {
      loadUser();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const earnedBadges = userData.badges.filter((badge) => badge.earned);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 0) + 12 }]}>
      <View style={styles.left}>
        <Image source={logo} style={styles.logo} />
        <View style={{ flexDirection: 'column' }}>
          <Text style={styles.introTxt}>
            Hi, <Text style={{ fontWeight: 'bold' }}>{userData.name}</Text>
          </Text>
          <Text style={styles.introTxt}>You got this!</Text>
        </View>
      </View>
      <View style={styles.right}>
        <View style={styles.badgeContainer}>
          {earnedBadges.length > 0 ? (
            earnedBadges.map((badge) => (
              <Image
                key={badge.id}
                source={badge.icon}
                style={styles.earnedBadgeIcon}
                resizeMode="contain"
              />
            ))
          ) : (
            <Image
              source={userData.headerBadgeIcon}
              style={[styles.earnedBadgeIcon, styles.lockedBadgeIcon]}
              resizeMode="contain"
            />
          )}
        </View>
        <View style={styles.ptsContainer}>
          <Text style={styles.ptsText}>{formatGamificationPoints(userData.points)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: withOpacity(Colors.primaryGreen, 0.6),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    width: '100%',
    marginBottom: 20,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  right: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  logo: {
    width: 60,
    height: 60,
    margin: 10,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  introTxt: {
    color: Colors.textDark,
    fontSize: 16,
  },
  badgeContainer: {
    backgroundColor: Colors.primaryGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    minHeight: 54,
    minWidth: 74,
    paddingHorizontal: 10,
    gap: 6,
  },
  ptsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  ptsText: {
    color: Colors.textDark,
    fontSize: 20,
    marginTop: 6,
  },
  earnedBadgeIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  lockedBadgeIcon: {
    opacity: 0.45,
  },
});
