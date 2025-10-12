import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { updateEvent } from '../db/database';

export default function EditEventScreen({ navigation, route }) {
  // 从路由参数获取事件对象
  const { event } = route.params;
  
  // 状态管理
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [startTime, setStartTime] = useState(event.startTime);
  const [endTime, setEndTime] = useState(event.endTime);
  const [reminder, setReminder] = useState(event.reminder ? event.reminder.toString() : '');
  
const validateTime = (time) => {
  if (!time) return false;
  
  // 检查格式是否为 HH:MM
  if (!/^\d{1,2}:\d{0,2}$/.test(time)) {
    return '格式应为 HH:MM';
  }
  
  const [hoursStr, minutesStr] = time.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr || '0', 10);
  
  if (isNaN(hours) || hours < 0 || hours > 23) {
    return '小时必须在 0-23 之间';
  }
  
  if (isNaN(minutes) || minutes < 0 || minutes > 59) {
    return '分钟必须在 0-59 之间';
  }
  
  return '';
};

  // 处理更新事件
  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert('错误', '标题不能为空');
      return;
    }
    
    try {
      // 创建更新对象
      const updatedEvent = {
        title,
        description,
        date: event.date,
        startTime,
        endTime,
        reminder: reminder ? parseInt(reminder) : null
      };
        if (!title.trim()) {
            Alert.alert('错误', '标题不能为空');
            return;
         }
        // 验证开始时间
        const startError = validateTime(startTime);
        if (startError) {
             Alert.alert('错误', `开始时间: ${startError}`);
             return;
        }

        // 验证结束时间
        const endError = validateTime(endTime);
        if (endError) {
            Alert.alert('错误', `结束时间: ${endError}`);
            return;
        }
          // 检查结束时间是否在开始时间之后
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        
        if (endTotalMinutes <= startTotalMinutes) {
            Alert.alert('错误', '结束时间必须在开始时间之后');
            return;
        }
        
      // 调用数据库函数更新事件
      await updateEvent(event.id, updatedEvent);
      
      // 更新成功后导航回查看日程页面
      navigation.navigate('ViewEvents', { selectedDate: event.date });
    } catch (error) {
      console.error('更新事件失败:', error);
      Alert.alert('错误', '更新事件失败，请重试');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>编辑日程</Text>
      
      <Text style={styles.dateText}>日期: {event.date}</Text>
      
      <Text style={styles.label}>标题 *</Text>
      <TextInput
        placeholder="请输入日程标题"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      
      <Text style={styles.label}>描述</Text>
      <TextInput
        placeholder="请输入日程描述"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.multilineInput]}
        multiline
      />
      
      <View style={styles.timeContainer}>
        <View style={styles.timeInputContainer}>
          <Text style={styles.label}>开始时间</Text>
          <TextInput
            placeholder="HH:MM"
            value={startTime}
            onChangeText={setStartTime}
            style={styles.timeInput}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        
        <View style={styles.timeInputContainer}>
          <Text style={styles.label}>结束时间</Text>
          <TextInput
            placeholder="HH:MM"
            value={endTime}
            onChangeText={setEndTime}
            style={styles.timeInput}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </View>
      
      <Text style={styles.label}>提醒时间 (分钟)</Text>
      <TextInput
        placeholder="提前多少分钟提醒"
        value={reminder}
        onChangeText={setReminder}
        style={styles.input}
        keyboardType="numeric"
      />
      
      <Button
        title="更新日程"
        onPress={handleUpdate}
        color="#2196F3"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  dateText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
});