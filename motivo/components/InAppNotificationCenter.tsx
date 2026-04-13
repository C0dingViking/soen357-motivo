import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../constants/colors';
import {
  InAppNotification,
  subscribeToInAppNotifications,
} from '../utils/notificationService';

export default function InAppNotificationCenter() {
  const insets = useSafeAreaInsets();
  const [notification, setNotification] = useState<InAppNotification | null>(null);
  const translateY = useRef(new Animated.Value(-120)).current;

  const hideNotification = () => {
    Animated.timing(translateY, {
      toValue: -120,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setNotification(null);
    });
  };

  const handleDismiss = () => {
    notification?.onDismiss?.();
    hideNotification();
  };

  useEffect(() => {
    const unsubscribe = subscribeToInAppNotifications((nextNotification) => {
      setNotification(nextNotification);
      translateY.setValue(-120);

      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      unsubscribe();
    };
  }, [translateY]);

  if (!notification) return null;

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Animated.View
        style={[
          styles.banner,
          {
            marginTop: insets.top + 8,
            transform: [{ translateY }],
          },
        ]}
      >
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.completeButton} onPress={handleDismiss}>
            <Text style={styles.completeText}>Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  banner: {
    width: '92%',
    backgroundColor: Colors.notificationBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    color: Colors.textDark,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  message: {
    color: Colors.textMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  completeButton: {
    backgroundColor: Colors.strongAccent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dismissButton: {
    borderColor: Colors.textMedium,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  completeText: {
    color: Colors.textDark,
    fontSize: 13,
    fontWeight: '700',
  },
  dismissText: {
    color: Colors.textMedium,
    fontSize: 13,
    fontWeight: '700',
  },
});
