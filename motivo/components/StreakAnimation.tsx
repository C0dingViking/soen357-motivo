import React, { useEffect, useState } from 'react';
import { Image, ImageSourcePropType, View, StyleSheet } from 'react-native';

import {
  OrangeStreakAnimation,
  WhiteStreakAnimation,
  GreenStreakAnimation,
  BlueStreakAnimation,
  PurpleStreakAnimation,
} from '../constants/streakAnimations';

interface StreakAnimationProps {
  streak: number;
  size?: number;
  interval?: number;
}

export const StreakAnimation: React.FC<StreakAnimationProps> = ({
  streak,
  size = 45,
  interval = 125,
}) => {
  const [frameIndex, setFrameIndex] = useState(0);
  let AnimationFrames: ImageSourcePropType[] = [];

  switch (true) {
    case streak >= 10:
      AnimationFrames = PurpleStreakAnimation;
      break;
    case streak >= 6:
      AnimationFrames = WhiteStreakAnimation;
      break;
    case streak >= 4:
      AnimationFrames = BlueStreakAnimation;
      break;
    case streak >= 2:
      AnimationFrames = GreenStreakAnimation;
      break;
    default:
      AnimationFrames = OrangeStreakAnimation;
  }

  useEffect(() => {
    const id = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % AnimationFrames.length);
    }, interval);

    return () => clearInterval(id);
  }, [interval]);

  const source: ImageSourcePropType = AnimationFrames[frameIndex];

  return <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />;
};
