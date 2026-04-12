import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ManageHabitsScreen from '../screens/ManageHabitsScreen';
import CreateHabitScreen from '../screens/CreateHabitScreen';
import { ManageStackParamList } from './types';

const Stack = createNativeStackNavigator<ManageStackParamList>();

export default function ManageStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Manage" component={ManageHabitsScreen} />
      <Stack.Screen name="ManageDetails" component={CreateHabitScreen} />
    </Stack.Navigator>
  );
}
