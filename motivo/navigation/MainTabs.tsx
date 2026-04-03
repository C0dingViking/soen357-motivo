import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ProgressScreen from '../screens/ProgressScreen';
import AddHabitScreen from '../screens/AddHabitScreen';
import RewardsScreen from '../screens/RewardsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { MainTabParamList } from './types';
import BottomNavBar from '../components/BottomNavBar';
import Header from '../components/Header';
import { Colors } from '../constants/colors';

const Tab = createMaterialTopTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <Header />
      <View style={styles.scene}>
        <Tab.Navigator
          screenOptions={{ swipeEnabled: false }}
          tabBarPosition="bottom"
          tabBar={(props) => <BottomNavBar {...props} />}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Progress" component={ProgressScreen} />
          <Tab.Screen name="Add" component={AddHabitScreen} />
          <Tab.Screen name="Rewards" component={RewardsScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scene: {
    flex: 1,
  },
});
