import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';

type BackButtonProps = {
  onPress: () => void;
};

export default function BackButton({ onPress }: BackButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Feather name="arrow-left" size={28} color={Colors.textDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    marginLeft: 2,
  },
});
