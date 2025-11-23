import DateTimePicker from '@react-native-community/datetimepicker';
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
import { updateEvent } from '../db/database';
import { getHoliday } from '../utils/holidays';
import { convertToLunar } from '../utils/lunarCalculator';
export default function EditEventScreen({ navigation, route }) {
  const { event } = route.params;
  // 解析原有的时间字符串
  const parseTimeString = (timeStr, date) => {
    if (!timeStr) return new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours || 9);
    dateTime.setMinutes(minutes || 0);
    dateTime.setSeconds(0);
    return dateTime;
  };

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  
  // 时间状态
  const [startTime, setStartTime] = useState(parseTimeString(event.startTime, event.date));
  const [endTime, setEndTime] = useState(parseTimeString(event.endTime, event.date));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const [reminder, setReminder] = useState(event.reminder ? event.reminder.toString() : '0');

  // 计算显示的时间字符串
  const startTimeString = startTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const endTimeString = endTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  // 获取农历日期字符串
  const getLunarDateString = (date) => {
    try {
      const lunarInfo = convertToLunar(date);
      if (!lunarInfo) return '无法获取农历信息';
      
      // 如果是节气，优先显示节气
      if (lunarInfo.isTerm && lunarInfo.term) {
      return `${lunarInfo.gzYear}${lunarInfo.animal}年 ${lunarInfo.month}${lunarInfo.day} ${lunarInfo.term}`;
      }
      
      // 返回完整的农历日期信息
      return `${lunarInfo.gzYear}${lunarInfo.animal}年 ${lunarInfo.month}${lunarInfo.day}`;
    } catch (error) {
      console.warn('获取农历信息失败:', error);
      return '无法获取农历信息';
    }
  };

  // 验证开始时间是否早于当前时间（仅对今日事件）
  const validateStartTime = (date, time) => {
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      const eventDateTime = new Date(date + 'T' + time.toLocaleTimeString('sv-SE'));
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
    const timeValidation = validateStartTime(event.date, startTime);
    if (timeValidation) {
      Alert.alert('错误', timeValidation);
      return;
    }

    // 验证结束时间是否在开始时间之后
    if (endTime <= startTime) {
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
      navigation.goBack();
    } catch (error) {
      console.error('更新失败:', error);
      Alert.alert('错误', '更新事件失败，请重试');
    }
  };

  const onStartChange = (event, selectedTime) => {
    setShowStartPicker(false);
    if (event.type === 'set' && selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const onEndChange = (event, selectedTime) => {
    setShowEndPicker(false);
    if (event.type === 'set' && selectedTime) {
      setEndTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>编辑日程</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.dateText}>📅 公历: {event.date}</Text>
        <Text style={styles.dateText}>📅 农历: {getLunarDateString(event.date)}</Text>
        {getHoliday(event.date)&&<Text style={styles.dateText}>🎉 {getHoliday(event.date)}</Text>}

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
          <View style={styles.timePickerContainer}>
            <Text style={styles.label}>开始时间</Text>
            <TouchableOpacity 
              style={styles.timeButton} 
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.timeButtonText}>{startTimeString}</Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="spinner"
                onChange={onStartChange}
                locale="zh-CN"
              />
            )}
          </View>
          
          {/* 结束时间选择器 */}
          <View style={styles.timePickerContainer}>
            <Text style={styles.label}>结束时间</Text>
            <TouchableOpacity 
              style={styles.timeButton} 
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.timeButtonText}>{endTimeString}</Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="spinner"
                onChange={onEndChange}
                locale="zh-CN"
              />
            )}
          </View>
          
          {/* 时间预览 */}
          <View style={styles.timePreview}>
            <Text style={styles.timePreviewText}>
              开始: {startTimeString} | 结束: {endTimeString}
            </Text>
            <Text style={styles.durationText}>
              持续时间: {Math.floor((endTime - startTime) / (1000 * 60 * 60))}小时
              {Math.floor((endTime - startTime) % (1000 * 60 * 60) / (1000 * 60))}分钟
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
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
  timePickerContainer: {
    marginBottom: 15,
  },
  timeButton: {
    backgroundColor: '#f1f8ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  timeButtonText: {
    fontSize: 20,
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  timePreview: {
    backgroundColor: '#f1f8ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  timePreviewText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 5,
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
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