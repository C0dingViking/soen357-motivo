import React, { useMemo, useState } from 'react';
import {
  Animated,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  LayoutChangeEvent,
} from 'react-native';
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../constants/colors';
import EmeraldPng from '../assets/navbar/Emerald.png';
import { withOpacity } from '../utils/colors';

type IconName = React.ComponentProps<typeof Feather>['name'];

const ROUTE_ICONS: Record<string, IconName> = {
  Home: 'home',
  Progress: 'pie-chart',
  Manage: 'plus',
  Rewards: 'hexagon',
  Settings: 'settings',
};

const TAB_BUTTON_WIDTH = 82;
const TAB_BUTTON_HEIGHT = 77;

export default function BottomNavBar({
  state,
  descriptors,
  navigation,
  position,
}: MaterialTopTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);

  const onBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  const indicator = useMemo(() => {
    const tabCount = state.routes.length;
    if (!barWidth || !tabCount) return null;

    const availableWidth = Math.max(0, barWidth);
    const segmentWidth = availableWidth / tabCount;
    const indicatorWidth = Math.max(0, Math.min(TAB_BUTTON_WIDTH, segmentWidth));

    const inputRange = state.routes.map((_, i) => i);
    const outputRange = state.routes.map((_, i) => i * segmentWidth);

    const baseTranslateX = (position as any).interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });

    const centerOffset = (segmentWidth - indicatorWidth) / 2;
    const translateX = Animated.add(baseTranslateX, centerOffset);

    return {
      translateX,
      indicatorWidth,
    };
  }, [barWidth, position, state.routes]);

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar} onLayout={onBarLayout}>
        {!!indicator && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                width: indicator.indicatorWidth,
                transform: [{ translateX: indicator.translateX }],
              },
              state.index === 0 && styles.indicatorFirst,
              state.index === state.routes.length - 1 && styles.indicatorLast,
            ]}
          />
        )}

        {state.routes.map((route, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

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
            <View key={route.key} style={styles.slot}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={(options as any).tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                activeOpacity={0.8}
                style={styles.tabButton}
              >
                {isRewards ? (
                  <Image source={EmeraldPng} style={styles.rewardsIcon} resizeMode="contain" />
                ) : (
                  <Feather name={icon} size={38} color={Colors.textDark} />
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: withOpacity(Colors.primaryGreen, 0.6),
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  indicator: {
    position: 'absolute',
    height: TAB_BUTTON_HEIGHT,
    backgroundColor: Colors.primaryGreen,
    borderRadius: 12,
  },
  indicatorFirst: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  indicatorLast: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  slot: {
    flex: 1,
    alignItems: 'center',
  },
  tabButton: {
    width: 82,
    height: 77,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsIcon: {
    width: 50,
    height: 50,
  },
});
