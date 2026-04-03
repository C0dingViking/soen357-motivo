import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../constants/colors';
import EmeraldPng from '../assets/navbar/Emerald.png';

type IconName = React.ComponentProps<typeof Feather>['name'];

const ROUTE_ICONS: Record<string, IconName> = {
  Home: 'home',
  Progress: 'pie-chart',
  Add: 'plus',
  Rewards: 'hexagon',
  Settings: 'settings',
};

export default function BottomNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isFirst = index === 0;
          const isLast = index === state.routes.length - 1;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          const icon = ROUTE_ICONS[route.name] ?? 'circle';
          const isRewards = route.name === 'Rewards';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.8}
              style={[
                styles.tabButton,
                isFocused && styles.tabButtonFocused,
                isFocused && isFirst && styles.tabButtonFocusedFirst,
                isFocused && isLast && styles.tabButtonFocusedLast,
              ]}
            >
              {isRewards ? (
                <Image source={EmeraldPng} style={styles.rewardsIcon} resizeMode="contain" />
              ) : (
                <Feather name={icon} size={38} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
  },
  bar: {
    backgroundColor: 'rgba(54, 159, 58, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    width: 82,
    height: 77,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonFocused: {
    backgroundColor: Colors.primaryGreen,
  },
  tabButtonFocusedFirst: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  tabButtonFocusedLast: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  rewardsIcon: {
    width: 50,
    height: 50,
  },
});
