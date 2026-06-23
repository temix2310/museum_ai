import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import PaintingDetailScreen from '../screens/PaintingDetailScreen';
import { ScanResult } from '../types';
import { Colors } from '../components/Theme';

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  PaintingDetail: { result: ScanResult };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.gold,
          headerTitleStyle: {
            fontFamily: 'Georgia',
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            title: 'MUSEUM AI',
            headerTitleAlign: 'center',
          }} 
        />
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen} 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="PaintingDetail" 
          component={PaintingDetailScreen} 
          options={{ 
            title: 'ЭКСПОНАТ',
            headerTitleAlign: 'center',
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
