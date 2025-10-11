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