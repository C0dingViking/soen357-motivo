import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { Colors } from '../../constants/colors';

type AddButtonProps = {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function AddButton({
  label = 'Add',
  onPress,
  disabled = false,
  style,
}: AddButtonProps) {
  return (
    <Pressable
      style={[styles.button, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.strongAccent,
    minWidth: 130,
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  text: {
    color: Colors.textDark,
    fontSize: 22,
    fontWeight: '500',
  },
});
