// App.js
import { Text } from '@react-navigation/elements';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { initDB } from '../db/database';
import AddEventScreen from '../screens/AddEventScreen';
import CalendarScreen from '../screens/CalendarScreen';
import EditEventScreen from '../screens/EditEventScreen';
import ViewEventsScreen from '../screens/ViewScreen';
import { initNotifications, setupNotificationResponseHandler } from '../utils/notifications';

const Stack = createNativeStackNavigator();

// 定义后台任务来处理通知
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error, executionInfo }) => {
  if (error) {
    console.error('后台任务错误:', error);
    return;
  }

  console.log('后台任务执行，收到数据:', data);
  // 在这里可以处理接收到的通知数据
  // 对于日历应用，我们主要关注的是确保通知能正确显示，而不是在此处理复杂逻辑
});

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [navigationRef, setNavigationRef] = useState(null);
  
  // 初始化数据库
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDB();
        const hasPermission = await initNotifications();
        console.log('通知权限状态:', hasPermission ? '已授予' : '未授予');
        
        // 注册后台任务
        try {
          await TaskManager.unregisterAllTasksAsync();
          await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
          console.log('后台任务注册成功');
        } catch (err) {
          console.error('后台任务注册失败:', err);
        }
        
        setDbInitialized(true);
      } catch (error) {
        console.error('应用初始化失败:', error);
        Alert.alert('错误', '应用初始化失败，请重启应用');
      }
    };
    
    initializeApp();
  }, []);

  const onReady = (nav: any) => {
    setNavigationRef(nav);
    setupNotificationResponseHandler(nav);
  };
  
  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>初始化应用...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} onLayout={() => {}}>
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
    </SafeAreaView>
  );
}