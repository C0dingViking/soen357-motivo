import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from 'rn-inkpad';

import { Colors } from '../constants/colors';
import { withOpacity } from '../utils/colors';

type Props = {
  nbCompletedHabits: number;
  nbTotalHabits: number;
};

export const ProgressCard = ({ nbCompletedHabits, nbTotalHabits }: Props) => {
  const progress = (nbTotalHabits > 0 ? nbCompletedHabits / nbTotalHabits : 0) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text>
          {progress >= 100 ? (
            'All done for today! Great job! 🎉'
          ) : (
            <>
              Keep going, only
              {/* The spaces are needed */}
              <Text style={{ color: Colors.primaryGreen }}>
                {' '}
                {nbTotalHabits - nbCompletedHabits}{' '}
              </Text>
              to go.
            </>
          )}
        </Text>
      </View>
      <ProgressBar
        value={progress}
        backgroundColor={withOpacity(Colors.strongAccent, 0.4)}
        progressColor={Colors.strongAccent}
        rounded={true}
        borderRadius={100}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.softAccent,
    borderColor: Colors.strongAccent,
    borderWidth: 1,
    borderRadius: 15,
    padding: 10,
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 10,
  },
});
