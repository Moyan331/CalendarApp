import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { addEvent } from '../db/database';

export default function AddEventScreen({ navigation, route }) {
  const selectedDate = route.params?.selectedDate || new Date().toISOString().split('T')[0];
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reminder, setReminder] = useState('15');
  const [startTimeError, setStartTimeError] = useState('');
  const [endTimeError, setEndTimeError] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('错误', '标题不能为空');
      return;
    }
    
    try {
      const event = {
        title,
        description,
        date: selectedDate,
        startTime,
        endTime,
        reminder: parseInt(reminder) || 0
      };
      
    

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

   // 格式化时间输入
  const formatTimeInput = (input) => {
    // 移除非数字字符
    let cleaned = input.replace(/[^\d]/g, '');
    
    // 限制长度为4位数字
    if (cleaned.length > 4) {
      cleaned = cleaned.substring(0, 4);
    }
    
    // 自动添加冒号
    if (cleaned.length > 2) {
      return `${cleaned.substring(0, 2)}:${cleaned.substring(2)}`;
    }
    
    return cleaned;
  };

  // 处理开始时间变化
  const handleStartTimeChange = (text) => {
    const formatted = formatTimeInput(text);
    setStartTime(formatted);
    
    // 验证时间
    const error = validateTime(formatted);
    setStartTimeError(error);
  };

  // 处理结束时间变化
  const handleEndTimeChange = (text) => {
    const formatted = formatTimeInput(text);
    setEndTime(formatted);
    
    // 验证时间
    const error = validateTime(formatted);
    setEndTimeError(error);
  };

  // 检查时间是否有效
  const isTimeValid = () => {
    return !validateTime(startTime) && !validateTime(endTime);
  };

  // 保存事件

    if (!isTimeValid()) {
      Alert.alert('错误', '请检查时间输入');
      return;
    }
    
    // 解析时间
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    // 检查结束时间是否在开始时间之后
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    if (endTotalMinutes <= startTotalMinutes) {
      Alert.alert('错误', '结束时间必须在开始时间之后');
      return;
    }
    
  // 调用数据库函数保存事件
      await addEvent(event);
      
      Alert.alert('成功', '日程已保存');
      navigation.goBack();
    } catch (error) {
      console.error('保存事件失败:', error);
      Alert.alert('错误', `保存事件失败: ${error.message}`);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>添加新日程</Text>
      <Text style={styles.dateText}>日期: {selectedDate}</Text>
      
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
        title="保存日程"
        onPress={handleSave}
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
    marginBottom: 10,
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