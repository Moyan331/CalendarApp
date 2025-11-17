// App.js
import { Text } from '@react-navigation/elements';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { initDB } from '../db/database';
import AddEventScreen from '../screens/AddEventScreen';
import CalendarScreen from '../screens/CalendarScreen';
import EditEventScreen from '../screens/EditEventScreen';
import ViewEventsScreen from '../screens/ViewScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  
  // 初始化数据库
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDB();
        setDbInitialized(true);
      } catch (error) {
        console.error('应用初始化失败:', error);
        Alert.alert('错误', '数据库初始化失败，请重启应用');
      }
    };
    
    initializeApp();
  }, []);
  
  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>初始化数据库...</Text>
      </View>
    );
  }
  
  return (
   
      <Stack.Navigator initialRouteName="Calendar">
        <Stack.Screen 
          name="Calendar" 
          component={CalendarScreen} 
          options={{ 
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="AddEvent" 
          component={AddEventScreen} 
          options={{ 
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="ViewEvents" 
          component={ViewEventsScreen} 
          options={{ 
            headerShown: false
          }} 
        />
        <Stack.Screen 
         name="EditEvent" 
         component={EditEventScreen} 
         options={{ 
          headerShown: false
        }} 
        />
      </Stack.Navigator>
  );
}