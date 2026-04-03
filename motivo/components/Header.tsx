import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

import { Colors } from '../constants/colors';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo_without_name.png';
import { withOpacity } from '../utils/colors';
import { Rank } from './Rank';
import { StreakAnimation } from './StreakAnimation';
import ptsIcon from '../assets/diamond-amethyst-1.png';

type UserStats = {
  name: string;
  rank: number;
  points: number;
  streak: number;
};

export default function Header() {
  const [userData, setUserData] = useState<UserStats>({
    name: 'User',
    rank: 0,
    points: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, rank, points, streak')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserData({
          name: data.full_name.split(' ')[0],
          rank: data.rank,
          points: data.points,
          streak: data.streak,
        });
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  return (
    <View style={styles.container}>
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
          <View style={styles.rankWrapper}>
            <Rank level={userData.rank} />
          </View>
          <View style={styles.streakWrapper}>
            <StreakAnimation streak={userData.streak} />
          </View>
        </View>
        <View style={styles.ptsContainer}>
          <Text style={styles.ptsText}>{_formatPoints(userData.points)}</Text>
          <Image source={ptsIcon} style={styles.ptsIcon} />
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
    paddingTop: 20,
    paddingBottom: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: '112%', //hacky but makes it take the full width of the screen
    marginTop: -8,
    marginBottom: 20,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  right: {
    flexDirection: 'column',
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
    justifyContent: 'flex-start',
    borderRadius: 20,
  },
  rankWrapper: {
    height: 50,
    justifyContent: 'flex-end',
    marginBottom: -5,
    marginLeft: 5,
  },
  streakWrapper: {
    height: 50,
    justifyContent: 'flex-start',
    marginTop: -12,
    marginRight: 5,
  },
  ptsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  ptsText: {
    marginRight: -5,
  },
  ptsIcon: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
  },
});

const _formatPoints = (pts: number) => {
  if (pts >= 1000) {
    return `${(pts / 1000).toFixed(1)}k`;
  }
  return pts.toString();
};
