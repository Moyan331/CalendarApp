import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const setupNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('需要通知权限来提醒日程');
  }

  // Android 通道设置
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
};

export const scheduleNotification = async (title, body, secondsFromNow) => {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { seconds: secondsFromNow },
  });
};
