import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TimePicker from '../components/TimePicker';
import { updateEvent } from '../db/database';

export default function EditEventScreen({ navigation, route }) {
  const { event } = route.params;
  
  // 解析原有的时间字符串
  const parseTimeString = (timeStr) => {
    if (!timeStr) return { hour: 9, minute: 0 };
    const [hour, minute] = timeStr.split(':').map(Number);
    return { hour: hour || 9, minute: minute || 0 };
  };

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  
  // 时间状态
  const [startHour, setStartHour] = useState(parseTimeString(event.startTime).hour);
  const [startMinute, setStartMinute] = useState(parseTimeString(event.startTime).minute);
  const [endHour, setEndHour] = useState(parseTimeString(event.endTime).hour);
  const [endMinute, setEndMinute] = useState(parseTimeString(event.endTime).minute);
  
  const [reminder, setReminder] = useState(event.reminder ? event.reminder.toString() : '0');

  // 计算显示的时间字符串
  const startTimeString = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
  const endTimeString = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

  // 验证开始时间是否早于当前时间（仅对今日事件）
  const validateStartTime = (date, hour, minute) => {
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      const eventDateTime = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
      const now = new Date();
      
      if (eventDateTime < now) {
        return '今日事件的开始时间不能早于当前时间';
      }
    }
    
    return '';
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert('错误', '标题不能为空');
      return;
    }

    // 验证开始时间是否早于当前时间
    const timeValidation = validateStartTime(event.date, startHour, startMinute);
    if (timeValidation) {
      Alert.alert('错误', timeValidation);
      return;
    }

    // 验证结束时间是否在开始时间之后
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    if (endTotalMinutes <= startTotalMinutes) {
      Alert.alert('错误', '结束时间必须在开始时间之后');
      return;
    }

    try {
      const updatedEvent = {
        title,
        description,
        date: event.date,
        startTime: startTimeString,
        endTime: endTimeString,
        reminder: reminder ? parseInt(reminder) : null,
      };
      
      await updateEvent(event.id, updatedEvent);
      Alert.alert('成功', '日程已更新');
      navigation.navigate('ViewEvents', { selectedDate: event.date });
    } catch (error) {
      console.error('更新失败:', error);
      Alert.alert('错误', '更新事件失败，请重试');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>编辑日程</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.dateText}>📅 {event.date}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>标题 *</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入日程标题"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>描述</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="请输入日程描述"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* 开始时间选择器 */}
          <TimePicker
            label="开始时间"
            selectedHour={startHour}
            selectedMinute={startMinute}
            onHourChange={setStartHour}
            onMinuteChange={setStartMinute}
          />
          
          {/* 结束时间选择器 */}
          <TimePicker
            label="结束时间"
            selectedHour={endHour}
            selectedMinute={endMinute}
            onHourChange={setEndHour}
            onMinuteChange={setEndMinute}
          />
          
          {/* 时间预览 */}
          <View style={styles.timePreview}>
            <Text style={styles.timePreviewText}>
              开始: {startTimeString} | 结束: {endTimeString}
            </Text>
            <Text style={styles.durationText}>
                          持续时间: {Math.floor((endHour * 60 + endMinute - startHour * 60 - startMinute) / 60)}小时
                          {(endHour * 60 + endMinute - startHour * 60 - startMinute) % 60}分钟
                        </Text>
          </View>

          <Text style={styles.label}>提前提醒</Text>
          <View style={styles.reminderContainer}>
            <Picker
              selectedValue={reminder}
              onValueChange={setReminder}
              style={styles.reminderPicker}
            >
              <Picker.Item label="不提醒" value="0" />
              <Picker.Item label="5分钟前" value="5" />
              <Picker.Item label="15分钟前" value="15" />
              <Picker.Item label="30分钟前" value="30" />
              <Picker.Item label="1小时前" value="60" />
              <Picker.Item label="2小时前" value="120" />
              <Picker.Item label="1天前" value="1440" />
            </Picker>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleUpdate}>
        <Icon name="check" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  header: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 20,
    elevation: 3,
  },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  dateText: { fontSize: 16, color: '#1976D2', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  label: { fontSize: 14, color: '#444', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  multilineInput: { height: 100, textAlignVertical: 'top' },
  timePreview: {
    backgroundColor: '#f1f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  timePreviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    textAlign: 'center',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  reminderContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  reminderPicker: {
    height: 50,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
});