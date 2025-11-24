import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

// 配置通知处理
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 设置通知通道 (Android)
export const setupNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('calendar-reminders', {
      name: '日程提醒',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }
};

// 请求通知权限
export const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// 安排通知
export const scheduleNotification = async (event) => {
  if (!event.reminder || event.reminder <= 0) return null;
  
  // 计算提醒时间
  const reminderTime = new Date(`${event.date}T${event.startTime}:00`);
  reminderTime.setMinutes(reminderTime.getMinutes() - event.reminder);
  
  // 如果提醒时间已过，不安排通知
  const now = new Date();
  if (reminderTime < now) {
    console.log('提醒时间已过，不安排通知');
    Alert.alert('提醒时间已过','将不会安排通知');
    return null;
  }
  
  console.log('安排通知:', {
    title: '日程提醒',
    body: `${event.title} 即将开始`,
    date: event.date,
    trigger: reminderTime
  });
  
  // 安排通知
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '日程提醒',
      body: `${event.title} 即将开始`,
      date: event.date,
      sound: 'default',
    },
    trigger: reminderTime,
  });
  
  return notificationId;
};

// 取消通知
export const cancelNotification = async (notificationId) => {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
};

// 初始化通知服务
export const initNotifications = async () => {
  await setupNotificationChannels();
  const hasPermission = await requestPermissions();
  console.log('通知权限状态:', hasPermission ? '已授予' : '未授予');
  return hasPermission;
};

// 设置通知点击处理
export const setupNotificationResponseHandler = (navigation) => {
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('收到通知响应:', response);
    const { eventId, date, screen } = response.notification.request.content.data;
    
    if (screen === 'ViewEvents' && date) {
      navigation.navigate('ViewEvents', { selectedDate: date });
    }
  });
  
  return subscription;
};