import React from 'react';
import { RankMap } from '../constants/ranks';
import { Image, ImageSourcePropType } from 'react-native';

interface RankProps {
  level: number;
  size?: number;
}

export const Rank: React.FC<RankProps> = ({ level, size = 50 }) => {
  level = Math.max(0, Math.min(level, 5)); // Ensure level is between 0 and 5
  const source: ImageSourcePropType = RankMap[level] || RankMap[0];
  return <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />;
};
