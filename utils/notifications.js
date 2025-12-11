import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
      bypassDnd: true,
    });
    
    // 为已过期的通知设置单独的通道
    await Notifications.setNotificationChannelAsync('expired-reminders', {
      name: '已过期提醒',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }
};

// 请求通知权限
export const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    // 尝试请求更多权限
    const { status: finalStatus } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
      android: {
        allowAlert: true,
        allowSound: true,
      }
    });
    return finalStatus === 'granted';
  }
  return status === 'granted';
};

// 注册推送令牌
export const registerForPushNotificationsAsync = async () => {
  if (!Device.isDevice) {
    console.log('必须在真实设备上使用推送通知功能');
    return;
  }

  try {
    const projectId = Constants.expoConfig.extra?.eas?.projectId;
    if (!projectId) {
      console.warn('缺少 projectId，无法获取推送令牌');
      return null;
    }
    
    const token = await Notifications.getExpoPushTokenAsync({
      projectId
    });
    
    console.log('推送令牌:', token.data);
    return token.data;
  } catch (error) {
    console.error('获取推送令牌失败:', error);
    return null;
  }
};

// 安排本地通知（保留原有功能）
export const scheduleLocalNotification = async (event) => {
  // 处理"立刻"提醒选项 (reminder = 0)
  if (event.reminder === 0) {
    // 对于"立刻"提醒，在事件开始时间安排通知
    const triggerTime = new Date(`${event.date}T${event.startTime}:00`);
    const now = new Date();
    
    // 如果开始时间已过，则立即发送通知
    if (triggerTime < now) {
      console.log('事件开始时间已过，立即发送通知');
      
      const expiredNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '事件开始提醒',
          body: `"${event.title}" 现在开始`,
          data: {
            date: event.date,
            screen: 'ViewEvents',
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          channelId: Platform.OS === 'android' ? 'expired-reminders' : undefined,
        },
        trigger: null, // 立即触发
      });
      
      return expiredNotificationId;
    }
    
    // 安排在事件开始时间的通知
    console.log('安排事件开始通知:', {
      title: '事件开始提醒',
      body: `"${event.title}" 现在开始`,
      date: event.date,
      trigger: triggerTime
    });
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '事件开始提醒',
        body: `"${event.title}" 现在开始`,
        data: {
          date: event.date,
          screen: 'ViewEvents',
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        channelId: Platform.OS === 'android' ? 'calendar-reminders' : undefined
      },
      trigger: triggerTime
    });
    
    return notificationId;
  }
  
  // 原有的提醒逻辑 - 不提醒 (reminder = -1) 或无效值
  if (!event.reminder || event.reminder < 0) return null;
  
  // 计算提醒时间
  const reminderTime = new Date(`${event.date}T${event.startTime}:00`);
  reminderTime.setMinutes(reminderTime.getMinutes() - event.reminder);
  
  // 获取当前时间
  const now = new Date();
  
  // 如果提醒时间已过，立即发送一个通知告知用户
  if (reminderTime < now) {
    console.log('提醒时间已过，立即发送过期通知');
    
    // 立即安排一个通知告知用户时间已过
    const expiredNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '提醒时间已过',
        body: `事件 "${event.title}" 的提醒时间已过`,
        data:{date: event.date,
              screen: 'ViewEvents',
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        channelId: Platform.OS === 'android' ? 'expired-reminders' : undefined,
      },
      trigger: null, // 立即触发
    });
    
    return expiredNotificationId;
  }
  
  console.log('安排通知:', {
    title: '日程提醒',
    body: `${event.title} 即将开始`,
    date: event.date,
    trigger: reminderTime
  });
  
  // 安排正常的通知
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '日程提醒',
      body: `${event.title} 即将开始`,
      data:{date: event.date,
            screen: 'ViewEvents',
      },
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
      channelId: Platform.OS === 'android' ? 'calendar-reminders' : undefined
    },
    trigger: reminderTime
  });
  
  return notificationId;
};

// 安排远程推送通知（通过服务器发送）
export const schedulePushNotification = async (pushToken, event) => {
  // 处理"立刻"提醒选项 (reminder = 0)
  if (event.reminder === 0) {
    if (!pushToken) {
      console.warn('无法安排推送通知：缺少推送令牌');
      // 回退到本地通知
      return await scheduleLocalNotification(event);
    }
    
    // 对于"立刻"提醒，在事件开始时间安排通知
    const triggerTime = new Date(`${event.date}T${event.startTime}:00`);
    const now = new Date();
    
    try {
      if (triggerTime < now) {
        console.log('事件开始时间已过，立即发送推送通知');
        
        // 发送即时推送通知
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: pushToken,
            title: '事件开始提醒',
            body: `"${event.title}" 现在开始`,
            data: {
              date: event.date,
              screen: 'ViewEvents',
            },
            priority: 'high',
            channelId: Platform.OS === 'android' ? 'expired-reminders' : undefined,
          }),
        });
        
        const result = await response.json();
        console.log('事件开始通知发送结果:', result);
        return result.data ? result.data.id : null;
      }
      
      // 安排在事件开始时间的推送通知
      console.log('安排事件开始推送通知:', {
        title: '事件开始提醒',
        body: `"${event.title}" 现在开始`,
        date: event.date,
        trigger: triggerTime
      });
      
      // 发送计划推送通知请求到Expo推送服务
      const response = await fetch('https://exp.host/--/api/v2/push/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          push_token: {
            type: 'expo',
            value: pushToken,
          },
          message: {
            title: '事件开始提醒',
            body: `"${event.title}" 现在开始`,
            data: {
              date: event.date,
              screen: 'ViewEvents',
            },
            priority: 'high',
            channelId: Platform.OS === 'android' ? 'calendar-reminders' : undefined,
          },
          scheduled_at: triggerTime.toISOString(),
        }),
      });
      
      const result = await response.json();
      console.log('事件开始推送通知安排结果:', result);
      return result.data ? result.data.id : null;
    } catch (error) {
      console.error('安排事件开始推送通知失败:', error);
      // 回退到本地通知
      return await scheduleLocalNotification(event);
    }
  }
  
  // 原有的提醒逻辑 - 不提醒 (reminder = -1) 或无效值
  if (!event.reminder || event.reminder < 0) return null;
  if (!pushToken) {
    console.warn('无法安排推送通知：缺少推送令牌');
    // 回退到本地通知
    return await scheduleLocalNotification(event);
  }
  
  // 计算提醒时间
  const reminderTime = new Date(`${event.date}T${event.startTime}:00`);
  reminderTime.setMinutes(reminderTime.getMinutes() - event.reminder);
  
  // 获取当前时间
  const now = new Date();
  
  // 如果提醒时间已过，立即发送一个通知告知用户
  if (reminderTime < now) {
    console.log('提醒时间已过，立即发送过期通知');
    
    try {
      // 发送即时推送通知
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: pushToken,
          title: '提醒时间已过',
          body: `事件 "${event.title}" 的提醒时间已过`,
          data: {
            date: event.date,
            screen: 'ViewEvents',
          },
          priority: 'high',
          channelId: Platform.OS === 'android' ? 'expired-reminders' : undefined,
        }),
      });
      
      const result = await response.json();
      console.log('过期通知发送结果:', result);
      return result.data ? result.data.id : null;
    } catch (error) {
      console.error('发送过期通知失败:', error);
      // 回退到本地通知
      return await scheduleLocalNotification(event);
    }
  }
  
  console.log('安排远程通知:', {
    title: '日程提醒',
    body: `${event.title} 即将开始`,
    date: event.date,
    trigger: reminderTime
  });
  
  try {
    // 发送计划推送通知请求到Expo推送服务
    const response = await fetch('https://exp.host/--/api/v2/push/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        push_token: {
          type: 'expo',
          value: pushToken,
        },
        message: {
          title: '日程提醒',
          body: `${event.title} 即将开始`,
          data: {
            date: event.date,
            screen: 'ViewEvents',
          },
          priority: 'high',
          channelId: Platform.OS === 'android' ? 'calendar-reminders' : undefined,
        },
        scheduled_at: reminderTime.toISOString(),
      }),
    });
    
    const result = await response.json();
    console.log('远程通知安排结果:', result);
    return result.data ? result.data.id : null;
  } catch (error) {
    console.error('安排远程通知失败:', error);
    // 回退到本地通知
    return await scheduleLocalNotification(event);
  }
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
    const data = response.notification.request.content.data || {};
    const { date, screen } = data;
    
    if (screen === 'ViewEvents' && date) {
      navigation.navigate('ViewEvents', { selectedDate: date });
    }
  });
  
  return subscription;
};